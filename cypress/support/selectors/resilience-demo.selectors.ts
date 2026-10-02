import { demoSelector, role, selector, testId } from './selector';

// Demo only (@demo). The primary data-qa deliberately does not exist on the site, so resolution always
// falls back to the logo's verified role+name strategy; the drift goes to the isolated demo log.
export const resilienceDemoSelectors = {
  degradedLogo: demoSelector(
    selector('resilienceDemo.degradedLogo', testId('logo-deliberately-missing'), role('img', 'Website for automation practice')),
  ),
};
