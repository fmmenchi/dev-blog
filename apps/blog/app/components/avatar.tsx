import styles from './avatar.module.css';

export interface AvatarProps {
  name: string;
  size?: number;
}

/** Initial-letter avatar. Decorative: the adjacent text carries the name. */
export function Avatar({ name, size = 60 }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={styles['avatar']}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {name.charAt(0)}
    </span>
  );
}
