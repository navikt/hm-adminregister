import parse from 'html-react-parser'
import { mapBackendStatusToFrontend } from 'news/News'
import styles from 'news/News.module.scss'
import NewsDropdownMenu from 'news/NewsDropdownMenu'
import NewsStatusTag from 'news/NewsStatusTag'
import { KeyedMutator } from 'swr'
import { toReadableString } from 'utils/date-util'
import { NewsRegistrationDTO } from 'utils/types/response-types'
import { NewsChunk } from 'utils/types/response-types'

import { ExpansionCard } from '@navikt/ds-react'

export default function NewsCard({
  news,
  mutateNewsRelease,
}: {
  news: NewsRegistrationDTO
  mutateNewsRelease: KeyedMutator<NewsChunk>
}) {
  const frontendStatus = mapBackendStatusToFrontend(news)

  return (
    <ExpansionCard aria-label={'Nyhetskort for ' + news.title}>
      <ExpansionCard.Header>
        <ExpansionCard.Title as="h2">{news.title}</ExpansionCard.Title>
        <ExpansionCard.Description>
          <span>
            Synlig på FinnHjelpemiddel fra {toReadableString(news.published)} til {toReadableString(news.expired)}
          </span>
        </ExpansionCard.Description>
        <NewsStatusTag newsStatus={frontendStatus} />
      </ExpansionCard.Header>
      <ExpansionCard.Content>
        <div className={styles.cardContainerDiv}>
          <span className={styles.seperatingLine}>{parse(news.text)}</span>
          <NewsDropdownMenu
            news={news}
            mutateNewsRelease={mutateNewsRelease}
            frontendStatus={frontendStatus}
            key={news.id}
          />
        </div>
      </ExpansionCard.Content>
    </ExpansionCard>
  )
}
