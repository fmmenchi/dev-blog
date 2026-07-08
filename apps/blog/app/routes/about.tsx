import { Button, Card } from '@dev-blog/ui';
import type { MetaFunction } from 'react-router';

import { Avatar } from '../components/avatar';
import { SectionHeading } from '../components/section-heading';
import { profile } from '../lib/content';
import styles from './about.module.css';

export const meta: MetaFunction = () => [
  { title: 'About — fabio.dev' },
  {
    name: 'description',
    content: `${profile.name}, ${profile.role} — ${profile.bioCard}`,
  },
];

export default function About() {
  return (
    <div className={styles['page']}>
      <aside className={styles['sidebar']}>
        <Card className={styles['profile']}>
          <Avatar name={profile.name} size={72} />
          <div>
            <p className={styles['name']}>{profile.name}</p>
            <p className={styles['role']}>{profile.role}</p>
          </div>
          <div className={styles['facts']}>
            <span>{profile.location}</span>
            <span>{profile.experience}</span>
          </div>
          <Button>Scrivimi</Button>
        </Card>
        <nav aria-label="Social" className={styles['social']}>
          <a href="https://github.com/fmmenchi">
            github
            <span className="sr-only"> (si apre in una nuova scheda)</span>
          </a>
          <a href="https://x.com/fmmenchi">
            x<span className="sr-only"> (si apre in una nuova scheda)</span>
          </a>
          <a href="https://www.linkedin.com/in/fmmenchi">
            linkedin
            <span className="sr-only"> (si apre in una nuova scheda)</span>
          </a>
        </nav>
      </aside>

      <main className={styles['main']}>
        <h1 className={styles['title']}>
          Ciao, sono <span className={styles['accent']}>{profile.name}</span>.
        </h1>
        <p className={styles['paragraph']}>
          Costruisco software da una decina d'anni, quasi sempre lato web:
          backend, frontend e tutto quello che sta in mezzo. Oggi lavoro su
          sistemi distribuiti — code, eventi, consistenza — e sul perché la
          maggior parte dei team non ne ha bisogno.
        </p>
        <p className={styles['paragraph']}>
          Questo blog è il mio quaderno pubblico: scrivo per capire, non per
          insegnare. Se un post ti è utile è un effetto collaterale gradito.
        </p>
        <p className={styles['paragraph']}>
          Credo nei monoliti ben fatti, nei tipi come documentazione e nel
          cancellare codice come forma d'arte.
        </p>

        <div className={styles['now']}>
          <SectionHeading>ora</SectionHeading>
        </div>
        <div className={styles['nowGrid']}>
          <div className={styles['nowBuild']}>
            <p className={styles['nowLabel']}>$ IN BUILD</p>
            <p className={styles['nowText']}>
              rss-gen — feed RSS type-safe in Rust
            </p>
          </div>
          <Card className={styles['nowRead']}>
            <p className={`${styles['nowLabel']} ${styles['nowLabelAccent']}`}>
              $ IN LETTURA
            </p>
            <p className={styles['nowText']}>
              Designing Data-Intensive Applications (rilettura)
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
