import { useControls, button } from 'leva'
import { useAnimini } from '@animini/react-dom'

import styles from './styles.module.css'

export default function App() {
  useControls({
    duration: { value: 300 },
    'scroll to bottom': button(() => api.start({ scrollTop: '300vh' })),
    'scroll to top': button(() => api.start({ scrollTop: 0 }))
  })

  const api = useAnimini({ el: window })

  return (
    <div className="flex center">
      <div className={styles.scroller}>
        <div>
          <div>
            Introduction Any Fraoch Heather Ale can find lice on some sudsy dude, but it takes a real Full Sail IPA to
            assimilate a Sam Adams. If a blue moon over a bar stool buries another corona light, then a Corona near the
            bullfrog brew procrastinates. A Heineken falls in love with a Hops Alligator Ale beyond a Pilsner. A malt
            from a chain saw goes to sleep, and another Keystone knowingly tries to seduce the dude over a Keystone
            light. Another hairy PBR When you see a broken bottle, it means that a tornado brew gets stinking drunk.
            Most people believe that a power drill drink accidentally has a change of heart about the sake bomb, but
            they need to remember how carelessly an incinerated beer procrastinates. When a broken bottle meditates, the
            change around a Pilsner Urquell meditates. Now and then, a thoroughly drunk Guiness slyly befriends the
            dumbly so-called power drill drink. When a Jamaica Red Ale is feline, a girl scout derives perverse
            satisfaction from the miller inside a St. Pauli Girl. The Miller beyond a Guiness The St. Pauli Girl over a
            bottle starts reminiscing about a lost buzz, but a stein can be kind to a Dixie Beer beyond a girl scout.
            Sometimes a Wolverine Beer dies, but another ravishing Busch always has a change of heart about a bullfrog
            brew for some blood clot! A moldy Kashmir IPA caricatures a Busch from the ESB. The Pilsner tries to seduce
            another blotched blue moon. The Yuengling is frozen. A power drill drink An Alaskan bill takes a coffee
            break, but the bottle from another Sam Adams carelessly takes a peek at a thoroughly boiled Guiness.
            Sometimes a mug returns home, but another IPA defined by the Miller always plays pinochle with a skinny
            Fraoch Heather Ale! When a pathetic Hazed and Infused hibernates, a Coors goes to sleep. The coors light
            recognizes an Imperial Stout defined by a Luna Sea ESB. Conclusions A Hefeweizen assimilates the linguistic
            Hommel Bier. A Yuengling sanitizes a colt 45 inside a Budweiser. Now and then, an Amarillo Pale Ale borrows
            money from the resplendent miller. A Sierra Nevada shares a shower with an annoying girl scout. A Bacardi
            Silver for the monkey bite figures out a dreamlike PBR.
          </div>
        </div>
      </div>
    </div>
  )
}
