import React from 'react'
import { Link, Route } from 'wouter'

import styles from './styles.module.css'

import Drag from './sandboxes/animini-drag/src/App'
import ConfigFat from './sandboxes/animini-config-fat/src/App'
import Inertia from './sandboxes/animini-inertia/src/App'
import Config from './sandboxes/animini-config/src/App'
import Perf from './sandboxes/animini-perf/src/App'
import Three from './sandboxes/animini-three/src/App'
import ThreePerf from './sandboxes/animini-three-perf/src/App'

const links = {
  'animini-drag': Drag,
  'animini-inertia': Inertia,
  'animini-config': Config,
  'animini-perf': Perf,
  'animini-three': Three,
  'animini-three-perf': ThreePerf,
  'animini-config-fat': ConfigFat
}

const Example = ({ link }) => {
  const Component = links[link]

  return (
    <>
      <Link href="/">
        {/*eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a className={styles.back}>← Back</a>
      </Link>
      <Component />
    </>
  )
}

export default function App() {
  return (
    <>
      <Route path="/">
        <div className={styles.page}>
          <h1>Animini demos</h1>
          <h2>Sandboxes</h2>
          <div className={styles.linkList}>
            {Object.keys(links).map((link) => (
              <Link key={link} href={`/${link}`}>
                {/*eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a className={styles.link}>{link}</a>
              </Link>
            ))}
          </div>
        </div>
      </Route>
      <Route path="/:link">{(params) => <Example link={params.link} />}</Route>
    </>
  )
}
