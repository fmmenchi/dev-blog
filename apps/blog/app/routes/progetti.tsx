import { Container } from '@dev-blog/ui';
import type { MetaFunction } from 'react-router';

export const meta: MetaFunction = () => [{ title: 'Progetti — fabio.dev' }];

export default function Progetti() {
  return (
    <Container as="main">
      <h1>Progetti</h1>
    </Container>
  );
}
