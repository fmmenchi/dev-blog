import { GithubIcon, LinkedinIcon, MailIcon } from '@dev-blog/icons';
import type { IconLinkItem } from '@dev-blog/ui';

import { socials } from './content';

/**
 * The socials, paired with their icons.
 *
 * The pairing lives here, not in `content.ts` (which is data, and should not
 * import components) and not in the design system (which must not know that this
 * blog has a GitHub). `IconLinks` takes the result as a prop.
 */
const ICON = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  mail: MailIcon,
} as const;

export const socialLinks: IconLinkItem[] = socials.map(({ label, href }) => ({
  label,
  href,
  icon: ICON[label as keyof typeof ICON] ?? MailIcon,
}));
