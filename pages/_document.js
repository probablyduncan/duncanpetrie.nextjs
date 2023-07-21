import { Html, Head, Main, NextScript } from 'next/document'
import { colors } from '@/data/colors.js'

async function getInitialProps(ctx) {
  const initialProps = await Document.getInitialProps(ctx);
  return initialProps;
}

export default function Document({ __NEXT_DATA__ }) {

  const backgroundColor = __NEXT_DATA__.page?.includes('wiki') ? colors.offWhite : colors.white;

  return (
    <Html lang="en" style={{ backgroundColor }}>
      <Head />
      <body style={{ backgroundColor }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
