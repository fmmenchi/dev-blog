import { Avatar, Button, Card, Link } from '@dev-blog/ui';

import { profile, socials } from '../lib/content';
import { avatarSrc } from '../lib/avatar-image';
import { originFromMatches, seoMeta } from '../lib/seo';
import { SITE_NAME } from '../lib/site';

/** The `plain` Link variant carries no styling: the nav gives it its own. */
const SOCIAL_LINK =
  'text-muted-foreground no-underline [transition:var(--transition-color)] hover:text-primary';

const PARAGRAPH = 'mb-4.5 text-[16.5px] leading-relaxed';

export const meta = ({
  matches,
  location,
}: {
  matches: ({ id: string; loaderData?: unknown } | undefined)[];
  location: { pathname: string };
}) =>
  seoMeta({
    origin: originFromMatches(matches),
    path: location.pathname,
    title: `About — ${SITE_NAME}`,
    description: `${profile.name}, ${profile.role} — ${profile.bioCard}`,
  });

export default function About() {
  return (
    // Phone: one column. From `md` the profile sidebar sits beside the prose.
    <div className="mx-auto grid w-full max-w-[var(--layout-content-width)] grid-cols-1 items-start gap-12 px-8 pt-14 pb-18 md:grid-cols-[300px_1fr]">
      {/* Sticky only once there is a column to be sticky in. */}
      <aside className="flex flex-col gap-3.5 md:sticky md:top-6">
        <Card className="flex flex-col items-start gap-3.5">
          <Avatar name={profile.name} src={avatarSrc} size={112} />
          <div>
            <p className="mb-1 text-[20px] font-bold">{profile.name}</p>
            <p className="font-mono text-xs text-primary">{profile.role}</p>
          </div>
          <div className="flex flex-col gap-2 font-mono text-xs text-muted-foreground">
            <span>{profile.location}</span>
            <span>{profile.experience}</span>
          </div>
          {/* An action that navigates stays a link; Slot lends it the button's looks. */}
          <Button asChild>
            <Link href="mailto:f.menchicchi@gmail.com" variant="plain">
              Say hi
            </Link>
          </Button>
        </Card>
        {/* No mail here: the "Say hi" button above is already the mail link. */}
        <nav
          aria-label="Social"
          className="flex gap-4.5 px-1.5 py-0.5 font-mono text-xs"
        >
          {socials
            .filter(({ href }) => !href.startsWith('mailto:'))
            .map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                variant="plain"
                className={SOCIAL_LINK}
              >
                {label}
              </Link>
            ))}
        </nav>
      </aside>

      <main className="min-w-0 max-w-[40rem]">
        <h1 className="mb-5.5 text-[clamp(1.875rem,4vw,2.75rem)] leading-tight font-bold tracking-[-0.03em]">
          Hi, I'm <span className="text-primary">{profile.name}</span>.
        </h1>
        <p className={PARAGRAPH}>
          I grew up in Arezzo, studied computer engineering in Bologna, and now
          write code from Cusco, in the Peruvian Andes. Thirteen years in,
          almost all of them on the web.
        </p>
        <p className={PARAGRAPH}>
          These days I build a product on mobile and web: the apps, the backend,
          and the Nx monorepo and release pipeline under all of it. A lot of
          that work, lately, is with AI. Before it, ten years on an enterprise
          supply-chain platform, where I built the frontend department from
          nothing: standards, design system, tooling, people. That is where I
          learned what conventions are worth.
        </p>
        <p className={PARAGRAPH}>
          I've come to believe that types and tests are what let you change your
          mind a year later, and that a release should be fast and automatic.
          But the only thing that really matters, to me, is the direction: get
          that right, and every change can be a small one.
        </p>
        <p className={PARAGRAPH}>
          This blog is my notebook. I write things down here to find out whether
          I actually understood them. If a post helps you understand something
          too, that makes me happy. I hope it does.
        </p>
      </main>
    </div>
  );
}
