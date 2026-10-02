// Builds the AppConfig from environment variables and the project's .env file (Node side only).
// Precedence: a non-empty environment variable wins over .env, so CI can override single values
// (an empty variable, e.g. an unset secret mapped into the job, does not mask the .env value).
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseEnv } from 'node:util';
import type { AccountProfile } from '../support/types/account';
import type { Product } from '../support/types/catalog';
import type { AppConfig } from '../support/types/config';

const TITLES: readonly AccountProfile['title'][] = ['Mr', 'Mrs'];
const PRODUCT_FIELDS = ['id', 'name', 'price', 'category', 'brand', 'availability', 'condition'] as const;

export function loadAppConfig(projectRoot: string): AppConfig {
  const envFile = path.join(projectRoot, '.env');
  const fromFile = existsSync(envFile) ? parseEnv(readFileSync(envFile, 'utf8')) : {};

  const missing: string[] = [];
  const problems: string[] = [];
  const optional = (key: string): string | undefined =>
    [process.env[key], fromFile[key]].map((value) => value?.trim()).find((value) => value) || undefined;
  const required = (key: string): string => {
    const value = optional(key);
    if (value === undefined) missing.push(key);
    return value ?? '';
  };

  const baseUrl = required('BASE_URL');
  if (baseUrl && !URL.canParse(baseUrl)) problems.push(`BASE_URL is not a valid URL: "${baseUrl}"`);

  const title = required('TEST_USER_TITLE');
  if (title && !TITLES.includes(title as AccountProfile['title'])) {
    problems.push(`TEST_USER_TITLE must be one of ${TITLES.join(', ')}, got "${title}"`);
  }

  const config: AppConfig = {
    baseUrl,
    testIdAttribute: required('TEST_ID_ATTRIBUTE'),
    blockHosts: (optional('BLOCK_HOSTS') ?? '').split(',').map((host) => host.trim()).filter(Boolean),
    testUser: {
      emailPrefix: required('TEST_USER_EMAIL_PREFIX'),
      emailDomain: required('TEST_USER_EMAIL_DOMAIN'),
      password: optional('TEST_USER_PASSWORD'),
      profile: {
        title: title as AccountProfile['title'],
        birthDate: required('TEST_USER_BIRTH_DAY'),
        birthMonth: required('TEST_USER_BIRTH_MONTH'),
        birthYear: required('TEST_USER_BIRTH_YEAR'),
        firstName: required('TEST_USER_FIRST_NAME'),
        lastName: required('TEST_USER_LAST_NAME'),
        company: required('TEST_USER_COMPANY'),
        address1: required('TEST_USER_ADDRESS1'),
        address2: required('TEST_USER_ADDRESS2'),
        country: required('TEST_USER_COUNTRY'),
        state: required('TEST_USER_STATE'),
        city: required('TEST_USER_CITY'),
        zipcode: required('TEST_USER_ZIPCODE'),
        mobileNumber: required('TEST_USER_MOBILE'),
      },
    },
    contact: {
      name: required('CONTACT_NAME'),
      emailPrefix: required('CONTACT_EMAIL_PREFIX'),
      emailDomain: required('CONTACT_EMAIL_DOMAIN'),
    },
    payment: {
      cardNumber: required('PAYMENT_CARD_NUMBER'),
      cvc: required('PAYMENT_CARD_CVC'),
      expiryMonth: required('PAYMENT_CARD_EXPIRY_MONTH'),
      expiryYear: optional('PAYMENT_CARD_EXPIRY_YEAR'),
    },
    catalog: [],
  };

  const catalogFile = required('CATALOG_FIXTURE');
  if (catalogFile) config.catalog = loadCatalog(path.resolve(projectRoot, catalogFile), problems);

  if (missing.length > 0 || problems.length > 0) {
    const details = [
      ...(missing.length ? [`Missing: ${missing.join(', ')}`] : []),
      ...problems,
    ];
    throw new Error(
      `Invalid test configuration.\n  - ${details.join('\n  - ')}\n` +
        'Copy .env.example to .env and fill it in, or set these as environment variables.',
    );
  }
  return config;
}

function loadCatalog(file: string, problems: string[]): Product[] {
  if (!existsSync(file)) {
    problems.push(`CATALOG_FIXTURE file not found: ${file}`);
    return [];
  }
  const data: unknown = JSON.parse(readFileSync(file, 'utf8'));
  if (!Array.isArray(data)) {
    problems.push(`CATALOG_FIXTURE must contain a JSON array of products: ${file}`);
    return [];
  }
  data.forEach((product, index) => {
    const absent = PRODUCT_FIELDS.filter((field) => product?.[field] === undefined);
    if (absent.length) problems.push(`CATALOG_FIXTURE product #${index} is missing: ${absent.join(', ')}`);
  });
  return data as Product[];
}
