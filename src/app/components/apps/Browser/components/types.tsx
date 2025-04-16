// Type Definitions
interface SearchResult {
  title: string
  description: string
  url: string
  source: 'google' | 'ai'
}

interface BrowserState {
  searchQuery: string
  results: SearchResult[]
  history: string[]
  pageNumber: number
  currentIndex: number
  mode: 'google' | 'ai'
  loading: boolean
  error: string | null
}
interface CustomSearchResult {
  kind?: string
  url: {
    type: string
    template: string
  }
  queries: {
    request: Query[]
    nextPage: Query[]
  }
  context: {
    title: string
  }
  searchInformation: {
    searchTime: number
    formattedSearchTime: string
    totalResults: string
    formattedTotalResults: string
  }
  items?: SearchItem[]
}

interface Query {
  title?: string
  totalResults: string
  searchTerms: string
  count: number
  startIndex: number
  inputEncoding?: string
  outputEncoding?: string
  safe?: string
  cx: string
}

interface SearchItem {
  kind: string
  title: string
  htmlTitle: string
  link: string
  displayLink: string
  snippet: string
  htmlSnippet?: string
  formattedUrl?: string
  htmlFormattedUrl?: string
  pagemap?: {
    cse_thumbnail?: Thumbnail[]
    metatags?: Metatag[]
    cse_image?: Image[]
  }
}

interface Thumbnail {
  src: string
  width: string
  height: string
}

interface Metatag {
  [key: string]: string
}

interface Image {
  src?: string
}

export type { SearchResult, BrowserState, CustomSearchResult }

export const testData = {
  kind: 'customsearch#search',
  url: {
    type: 'application/json',
    template:
      'https://www.googleapis.com/customsearch/v1?q={searchTerms}&num={count?}&start={startIndex?}&lr={language?}&safe={safe?}&cx={cx?}&sort={sort?}&filter={filter?}&gl={gl?}&cr={cr?}&googlehost={googleHost?}&c2coff={disableCnTwTranslation?}&hq={hq?}&hl={hl?}&siteSearch={siteSearch?}&siteSearchFilter={siteSearchFilter?}&exactTerms={exactTerms?}&excludeTerms={excludeTerms?}&linkSite={linkSite?}&orTerms={orTerms?}&dateRestrict={dateRestrict?}&lowRange={lowRange?}&highRange={highRange?}&searchType={searchType}&fileType={fileType?}&rights={rights?}&imgSize={imgSize?}&imgType={imgType?}&imgColorType={imgColorType?}&imgDominantColor={imgDominantColor?}&alt=json',
  },
  queries: {
    request: [
      {
        title: 'Google Custom Search - kingdom of heaven',
        totalResults: '120000000',
        searchTerms: 'kingdom of heaven',
        count: 10,
        startIndex: 1,
        inputEncoding: 'utf8',
        outputEncoding: 'utf8',
        safe: 'off',
        cx: '943e9dbfd359c4b57',
      },
    ],
    nextPage: [
      {
        title: 'Google Custom Search - kingdom of heaven',
        totalResults: '120000000',
        searchTerms: 'kingdom of heaven',
        count: 10,
        startIndex: 11,
        inputEncoding: 'utf8',
        outputEncoding: 'utf8',
        safe: 'off',
        cx: '943e9dbfd359c4b57',
      },
    ],
  },
  context: {
    title: 'No Engine',
  },
  searchInformation: {
    searchTime: 0.400167,
    formattedSearchTime: '0.40',
    totalResults: '120000000',
    formattedTotalResults: '120,000,000',
  },
  items: [
    {
      kind: 'customsearch#result',
      title: 'Kingdom of Heaven (film) - Wikipedia',
      htmlTitle:
        '\u003cb\u003eKingdom of Heaven\u003c/b\u003e (film) - Wikipedia',
      link: 'https://en.wikipedia.org/wiki/Kingdom_of_Heaven_(film)',
      displayLink: 'en.wikipedia.org',
      snippet:
        'Kingdom of Heaven (film) ... Kingdom of Heaven is a 2005 epic historical drama film directed and produced by Ridley Scott and written by William Monahan. It ...',
      htmlSnippet:
        '\u003cb\u003eKingdom of Heaven\u003c/b\u003e (film) ... \u003cb\u003eKingdom of Heaven\u003c/b\u003e is a 2005 epic historical drama film directed and produced by Ridley Scott and written by William Monahan. It&nbsp;...',
      formattedUrl: 'https://en.wikipedia.org/wiki/Kingdom_of_Heaven_(film)',
      htmlFormattedUrl:
        'https://en.wikipedia.org/wiki/\u003cb\u003eKingdom_of_Heaven\u003c/b\u003e_(film)',
      pagemap: {
        metatags: [
          {
            referrer: 'origin',
            'og:image':
              'https://upload.wikimedia.org/wikipedia/en/9/9e/KoHposter.jpg',
            'theme-color': '#eaecf0',
            'og:image:width': '1200',
            'og:type': 'website',
            viewport:
              'width=device-width, initial-scale=1.0, user-scalable=yes, minimum-scale=0.25, maximum-scale=5.0',
            'og:title': 'Kingdom of Heaven (film) - Wikipedia',
            'og:image:height': '1772',
            'format-detection': 'telephone=no',
          },
        ],
      },
    },
    {
      kind: 'customsearch#result',
      title: 'Kingdom of Heaven (2005) - IMDb',
      htmlTitle: '\u003cb\u003eKingdom of Heaven\u003c/b\u003e (2005) - IMDb',
      link: 'https://www.imdb.com/title/tt0320661/',
      displayLink: 'www.imdb.com',
      snippet:
        'Kingdom of Heaven: Directed by Ridley Scott. With Martin Hancock, Michael Sheen, Nathalie Cox, Eriq Ebouaney. Balian of Ibelin travels to Jerusalem during ...',
      htmlSnippet:
        '\u003cb\u003eKingdom of Heaven\u003c/b\u003e: Directed by Ridley Scott. With Martin Hancock, Michael Sheen, Nathalie Cox, Eriq Ebouaney. Balian of Ibelin travels to Jerusalem during&nbsp;...',
      formattedUrl: 'https://www.imdb.com/title/tt0320661/',
      htmlFormattedUrl: 'https://www.imdb.com/title/tt0320661/',
      pagemap: {
        cse_thumbnail: [
          {
            src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoNVsdhv-dLdlsY1dGSrcU0XmUnP5Q8U22w3AYKPZPjoUhCRq0ecH_bPUY&s',
            width: '184',
            height: '273',
          },
        ],
        metatags: [
          {
            'og:image':
              'https://m.media-amazon.com/images/M/MV5BMzdhNGZhMjQtYjVmNy00OWMyLTk1MmQtZGNhZDYwMzZlZjI3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
            'og:type': 'video.movie',
            'og:image:width': '1000',
            'twitter:title':
              'Kingdom of Heaven (2005) ⭐ 7.3 | Action, Adventure, Drama',
            'twitter:card': 'summary_large_image',
            'imdb:subpagetype': 'main',
            'og:site_name': 'IMDb',
            'og:title':
              'Kingdom of Heaven (2005) ⭐ 7.3 | Action, Adventure, Drama',
            'imdb:pageconst': 'tt0320661',
            'og:image:height': '1481.1031664964248',
            'og:description': '2h 24m | R',
            'twitter:image':
              'https://m.media-amazon.com/images/M/MV5BMzdhNGZhMjQtYjVmNy00OWMyLTk1MmQtZGNhZDYwMzZlZjI3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
            'next-head-count': '49',
            'twitter:image:alt':
              'Kingdom of Heaven: Directed by Ridley Scott. With Martin Hancock, Michael Sheen, Nathalie Cox, Eriq Ebouaney. Balian of Ibelin travels to Jerusalem during the Crusades of the 12th century, and there he finds himself as the defender of the city and its people.',
            'twitter:site': '@IMDb',
            'og:locale:alternate': 'es_ES',
            viewport: 'width=device-width',
            'twitter:description': '2h 24m | R',
            'og:locale': 'en_US',
            'og:url': 'https://www.imdb.com/title/tt0320661/',
            'imdb:pagetype': 'title',
          },
        ],
        cse_image: [
          {
            src: 'https://m.media-amazon.com/images/M/MV5BMzdhNGZhMjQtYjVmNy00OWMyLTk1MmQtZGNhZDYwMzZlZjI3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
          },
        ],
      },
    },
    {
      kind: 'customsearch#result',
      title: 'Kingdom of Heaven | Rotten Tomatoes',
      htmlTitle:
        '\u003cb\u003eKingdom of Heaven\u003c/b\u003e | Rotten Tomatoes',
      link: 'https://www.rottentomatoes.com/m/kingdom_of_heaven',
      displayLink: 'www.rottentomatoes.com',
      snippet:
        'Village blacksmith Balian (Orlando Bloom) joins his long-estranged father, Baron Godfrey (Liam Neeson), as a crusader on the road to Jerusalem.',
      htmlSnippet:
        'Village blacksmith Balian (Orlando Bloom) joins his long-estranged father, Baron Godfrey (Liam Neeson), as a crusader on the road to Jerusalem.',
      formattedUrl: 'https://www.rottentomatoes.com/m/kingdom_of_heaven',
      htmlFormattedUrl:
        'https://www.rottentomatoes.com/m/\u003cb\u003ekingdom_of_heaven\u003c/b\u003e',
      pagemap: {
        cse_thumbnail: [
          {
            src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQa3yHHoxxnV6fxG1Xemw02jCtKKGtKdFDGNR3Lf2Xw0QngEQxC12Q3gN-_&s',
            width: '184',
            height: '273',
          },
        ],
        metatags: [
          {
            'og:image':
              'https://resizing.flixster.com/-7rUsqmdLrRKonLMbvEFwhzn568=/206x305/v2/https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p35756_p_v13_ax.jpg',
            'twitter:card': 'summary',
            'twitter:title': 'Kingdom of Heaven | Rotten Tomatoes',
            'og:type': 'video.movie',
            'theme-color': '#FA320A',
            'og:site_name': 'Rotten Tomatoes',
            'msvalidate.01': '034F16304017CA7DCF45D43850915323',
            'og:title': 'Kingdom of Heaven | Rotten Tomatoes',
            'og:description':
              "Still in grief over his wife's sudden death, village blacksmith Balian (Orlando Bloom) joins his long-estranged father, Baron Godfrey (Liam Neeson), as a crusader on the road to Jerusalem. After a perilous journey to the holy city, the valiant young man enters the retinue of the leprous King Baldwin IV (Edward Norton), which is rife with dissent led by the treacherous Guy de Lusignan (Marton Csokas), who wishes to wage war against the Muslims for his own political and personal gain.",
            'twitter:image':
              'https://resizing.flixster.com/-7rUsqmdLrRKonLMbvEFwhzn568=/206x305/v2/https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p35756_p_v13_ax.jpg',
            'twitter:text:title': 'Kingdom of Heaven | Rotten Tomatoes',
            viewport: 'width=device-width, initial-scale=1',
            'twitter:description':
              "Still in grief over his wife's sudden death, village blacksmith Balian (Orlando Bloom) joins his long-estranged father, Baron Godfrey (Liam Neeson), as a crusader on the road to Jerusalem. After a perilous journey to the holy city, the valiant young man enters the retinue of the leprous King Baldwin IV (Edward Norton), which is rife with dissent led by the treacherous Guy de Lusignan (Marton Csokas), who wishes to wage war against the Muslims for his own political and personal gain.",
            'og:locale': 'en_US',
            'og:url': 'https://www.rottentomatoes.com/m/kingdom_of_heaven',
          },
        ],
        cse_image: [
          {
            src: 'https://resizing.flixster.com/-7rUsqmdLrRKonLMbvEFwhzn568=/206x305/v2/https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p35756_p_v13_ax.jpg',
          },
        ],
      },
    },
    {
      kind: 'customsearch#result',
      title:
        'Do you think Kingdom of Heaven is one of the best epic movies of all ...',
      htmlTitle:
        'Do you think \u003cb\u003eKingdom of Heaven\u003c/b\u003e is one of the best epic movies of all ...',
      link: 'https://www.reddit.com/r/moviecritic/comments/1c8qwv0/do_you_think_kingdom_of_heaven_is_one_of_the_best/',
      displayLink: 'www.reddit.com',
      snippet:
        "Apr 20, 2024 ... The Director's Cut of Kingdom of Heaven is far superior to the theatrical cut. The LOTR films have an epic scope and feel to them. You also can't go wrong with ...",
      htmlSnippet:
        'Apr 20, 2024 \u003cb\u003e...\u003c/b\u003e The Director&#39;s Cut of \u003cb\u003eKingdom of Heaven\u003c/b\u003e is far superior to the theatrical cut. The LOTR films have an epic scope and feel to them. You also can&#39;t go wrong with&nbsp;...',
      formattedUrl:
        'https://www.reddit.com/.../do_you_think_kingdom_of_heaven_is_one_of_...',
      htmlFormattedUrl:
        'https://www.reddit.com/.../do_you_think_\u003cb\u003ekingdom_of_heaven\u003c/b\u003e_is_one_of_...',
      pagemap: {
        cse_thumbnail: [
          {
            src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkjnWxbm-KAPqKnd1rALVeX36LyC12BpqT3CFiQQ8kjpAFMIsi2qiw6tk&s',
            width: '183',
            height: '275',
          },
        ],
        metatags: [
          {
            'og:image':
              'https://preview.redd.it/do-you-think-kingdom-of-heaven-is-one-of-the-best-epic-v0-ykx0eism6nvc1.jpeg?auto=webp&s=4395f0d261e912c4c92af250f51b61bfae2f73a3',
            'theme-color': '#000000',
            'og:image:width': '700',
            'og:type': 'website',
            'og:image:alt':
              't A RIDLEY SCOTT M KINGDOM OF HEAVEN ORLANDO BLOOM VAIN MENTIONS DAVID THEMUS PENDAN GLEESON MARTON CSOKAL LIAM NEESON EDWARD NORTONESSAN MASSOUD ALEXANDER SIG VELIBOR TOPIC MICHAEL SHEEN HAREY CRECSON WILLIAMS RIDLEY SCOTT WILLIAM MONAHANLEY SCOTT',
            'twitter:card': 'summary_large_image',
            'twitter:title':
              'r/moviecritic on Reddit: Do you think Kingdom of Heaven is one of the best epic movies of all time? And also what is your favorite epic movie?',
            'og:site_name': 'Reddit',
            'og:title':
              'r/moviecritic on Reddit: Do you think Kingdom of Heaven is one of the best epic movies of all time? And also what is your favorite epic movie?',
            'og:image:height': '1050',
            'msapplication-navbutton-color': '#000000',
            'og:description':
              'Posted by u/Ghaleon32 - 428 votes and 270 comments',
            'twitter:image':
              'https://preview.redd.it/do-you-think-kingdom-of-heaven-is-one-of-the-best-epic-v0-ykx0eism6nvc1.jpeg?auto=webp&s=4395f0d261e912c4c92af250f51b61bfae2f73a3',
            'apple-mobile-web-app-status-bar-style': 'black',
            'twitter:site': '@reddit',
            viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
            'apple-mobile-web-app-capable': 'yes',
            'og:ttl': '600',
            'og:url':
              'https://www.reddit.com/r/moviecritic/comments/1c8qwv0/do_you_think_kingdom_of_heaven_is_one_of_the_best/',
          },
        ],
        cse_image: [
          {
            src: 'https://preview.redd.it/do-you-think-kingdom-of-heaven-is-one-of-the-best-epic-v0-ykx0eism6nvc1.jpeg?auto=webp&s=4395f0d261e912c4c92af250f51b61bfae2f73a3',
          },
        ],
      },
    },
    {
      kind: 'customsearch#result',
      title: 'The Kingdom of Heaven Is Like... - Western Theological Seminary',
      htmlTitle:
        'The \u003cb\u003eKingdom of Heaven\u003c/b\u003e Is Like... - Western Theological Seminary',
      link: 'https://www.westernsem.edu/the-kingdom-of-heaven/',
      displayLink: 'www.westernsem.edu',
      snippet:
        'Dec 6, 2017 ... The kingdom of heaven is like a mustard seed that a man took and sowed in his field. It is the smallest of all seeds.',
      htmlSnippet:
        'Dec 6, 2017 \u003cb\u003e...\u003c/b\u003e The \u003cb\u003ekingdom of heaven\u003c/b\u003e is like a mustard seed that a man took and sowed in his field. It is the smallest of all seeds.',
      formattedUrl: 'https://www.westernsem.edu/the-kingdom-of-heaven/',
      htmlFormattedUrl:
        'https://www.westernsem.edu/the-\u003cb\u003ekingdom-of-heaven\u003c/b\u003e/',
      pagemap: {
        cse_thumbnail: [
          {
            src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLajHQ6WFIaUNP1M4grgARVvTwPOeCQmyugRlEHMvZ5HrqZWObPcOUXQ&s',
            width: '404',
            height: '125',
          },
        ],
        metatags: [
          {
            'og:image':
              'https://www.westernsem.edu/wp-content/uploads/2017/12/Copy-of-Blog-Header-Image-Template-10.png',
            'og:type': 'article',
            'article:published_time': '2017-12-06T12:00:51+00:00',
            'og:image:width': '1920',
            'twitter:card': 'summary_large_image',
            'og:site_name': 'Western Theological Seminary',
            author: 'Anne Chanski',
            'og:title':
              'The Kingdom of Heaven Is Like... - Western Theological Seminary',
            'og:image:height': '595',
            'twitter:label1': 'Written by',
            'twitter:label2': 'Est. reading time',
            'og:image:type': 'image/png',
            'msapplication-tileimage':
              'https://www.westernsem.edu/wp-content/uploads/2023/10/cropped-WTS-icon-square2small-270x270.png',
            'og:description':
              'Senior student Shaelee Boender reflects on her summer internship, learning what the Kingdom of Heaven is like.',
            'twitter:creator': '@westernsem',
            'article:publisher': 'https://www.facebook.com/westernsem',
            'twitter:data1': 'Anne Chanski',
            'twitter:data2': '3 minutes',
            'twitter:site': '@westernsem',
            'article:modified_time': '2024-01-23T22:24:54+00:00',
            viewport:
              'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
            'og:locale': 'en_US',
            'og:url': 'https://www.westernsem.edu/the-kingdom-of-heaven/',
          },
        ],
        cse_image: [
          {
            src: 'https://www.westernsem.edu/wp-content/uploads/2017/12/Copy-of-Blog-Header-Image-Template-10.png',
          },
        ],
      },
    },
    {
      kind: 'customsearch#result',
      title:
        'KB - “The entrance fee into the kingdom of heaven is... | Facebook',
      htmlTitle:
        'KB - “The entrance fee into the \u003cb\u003ekingdom of heaven\u003c/b\u003e is... | Facebook',
      link: 'https://www.facebook.com/KB116/posts/the-entrance-fee-into-the-kingdom-of-heaven-is-nothing-the-annual-subscription-i/930188618464515/',
      displayLink: 'www.facebook.com',
      snippet:
        'Jan 8, 2024 ... The entrance fee into the kingdom of heaven is nothing: the annual subscription is everything.“ All to Jesus, I surrender…',
      htmlSnippet:
        'Jan 8, 2024 \u003cb\u003e...\u003c/b\u003e The entrance fee into the \u003cb\u003ekingdom of heaven\u003c/b\u003e is nothing: the annual subscription is everything.“ All to Jesus, I surrender…',
      formattedUrl:
        'https://www.facebook.com/...kingdom-of-heaven.../930188618464515/',
      htmlFormattedUrl:
        'https://www.facebook.com/...\u003cb\u003ekingdom-of-heaven\u003c/b\u003e.../930188618464515/',
      pagemap: {
        cse_thumbnail: [
          {
            src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgW8cucP_qMKAIE8mQsBv7zCPW0IwW4lYHiFZt2Ia7SgIUZVdknM-3bsaa&s',
            width: '225',
            height: '225',
          },
        ],
        metatags: [
          {
            'og:image':
              'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=930188541797856',
            'og:type': 'video.other',
            'og:image:alt': 'KB',
            'twitter:card': 'summary',
            'twitter:title': 'KB',
            'theme-color': '#FFFFFF',
            'og:title': 'KB',
            google: 'notranslate',
            'og:description':
              '“The entrance fee into the kingdom of heaven is nothing: the annual subscription is everything.“\nAll to Jesus, I surrender…\n📸by @neidymarie.jpg',
            'twitter:image':
              'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=930188541797856',
            referrer: 'origin-when-crossorigin',
            'twitter:image:alt': 'KB',
            'twitter:site': '@facebookapp',
            viewport: 'width=device-width, initial-scale=1',
            'twitter:description':
              '“The entrance fee into the kingdom of heaven is nothing: the annual subscription is everything.“\nAll to Jesus, I surrender…\n📸by @neidymarie.jpg',
            'og:locale': 'en_US',
            'fb-version': '443.0.0.0.106:2716',
            'og:url':
              'https://www.facebook.com/KB116/posts/the-entrance-fee-into-the-kingdom-of-heaven-is-nothing-the-annual-subscription-i/930188618464515/',
          },
        ],
        cse_image: [
          {
            src: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=930188541797856',
          },
        ],
      },
    },
    {
      kind: 'customsearch#result',
      title:
        'Episode 32: Kingdom of Heaven - Historians At The Movies - Apple ...',
      htmlTitle:
        'Episode 32: \u003cb\u003eKingdom of Heaven\u003c/b\u003e - Historians At The Movies - Apple ...',
      link: 'https://podcasts.apple.com/us/podcast/episode-32-kingdom-of-heaven-with-david-perry/id1658432453?i=1000619359169',
      displayLink: 'podcasts.apple.com',
      snippet:
        "Jul 5, 2023 ... Today we jump in head first to the Director's Cut of Ridley Scott's 2005 epic, Kingdom of Heaven. This is a beautiful and seriously flawed film, but it is fun ...",
      htmlSnippet:
        'Jul 5, 2023 \u003cb\u003e...\u003c/b\u003e Today we jump in head first to the Director&#39;s Cut of Ridley Scott&#39;s 2005 epic, \u003cb\u003eKingdom of Heaven\u003c/b\u003e. This is a beautiful and seriously flawed film, but it is fun&nbsp;...',
      formattedUrl:
        'https://podcasts.apple.com/us/...32-kingdom-of-heaven.../id1658432453?...',
      htmlFormattedUrl:
        'https://podcasts.apple.com/us/...32-\u003cb\u003ekingdom-of-heaven\u003c/b\u003e.../id1658432453?...',
      pagemap: {
        cse_thumbnail: [
          {
            src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwtFnKOM6ap63hudUEimhaWGDxjx5nM1QIgX-gjwTc47-U8ttUxQLS7Wg&s',
            width: '225',
            height: '225',
          },
        ],
        metatags: [
          {
            'og:image':
              'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/97/c1/ab/97c1ab98-12d1-4fa8-f143-dfc5802199a5/mza_12812486687250876079.jpg/1200x1200ECA.PESS01-60.jpg?imgShow=Podcasts211/v4/61/4c/26/614c2694-661c-734a-e13c-35ac53633dc4/mza_7200875358157761330.jpg',
            'og:image:width': '1200',
            'twitter:card': 'summary',
            'og:site_name': 'Apple Podcasts',
            'applicable-device': 'pc,mobile',
            'og:image:type': 'image/jpg',
            'og:description':
              'Podcast Episode · Historians At The Movies · 07/05/2023 · 1h 23m',
            'al:ios:app_store_id': '525463029',
            'og:image:secure_url':
              'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/97/c1/ab/97c1ab98-12d1-4fa8-f143-dfc5802199a5/mza_12812486687250876079.jpg/1200x1200ECA.PESS01-60.jpg?imgShow=Podcasts211/v4/61/4c/26/614c2694-661c-734a-e13c-35ac53633dc4/mza_7200875358157761330.jpg',
            'twitter:image':
              'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/97/c1/ab/97c1ab98-12d1-4fa8-f143-dfc5802199a5/mza_12812486687250876079.jpg/1200x1200ECA.PESS01-60.jpg?imgShow=Podcasts211/v4/61/4c/26/614c2694-661c-734a-e13c-35ac53633dc4/mza_7200875358157761330.jpg',
            'twitter:image:alt':
              'Episode 32: Kingdom of Heaven with David Perry, Matt Gabriele, Thomas Lecaque, & John Wyatt Greenlee',
            'twitter:site': '@ApplePodcasts',
            'og:image:alt':
              'Episode 32: Kingdom of Heaven with David Perry, Matt Gabriele, Thomas Lecaque, & John Wyatt Greenlee',
            'og:type': 'website',
            'twitter:title':
              'Episode 32: Kingdom of Heaven with David Perry, Matt Gabriele, Thomas Lecaque, & John Wyatt Greenlee',
            'apple:title':
              'Episode 32: Kingdom of Heaven with David Perry, Matt Gabriele, Thomas Lecaque, & John Wyatt Greenlee',
            'al:ios:app_name': 'Apple Podcasts',
            'og:title':
              'Episode 32: Kingdom of Heaven with David Perry, Matt Gabriele, Thomas Lecaque, & John Wyatt Greenlee',
            'og:image:height': '1200',
            version: '2450.5.0-external',
            referrer: 'strict-origin',
            viewport: 'width=device-width,initial-scale=1',
            'twitter:description':
              'Podcast Episode · Historians At The Movies · 07/05/2023 · 1h 23m',
            'apple:description':
              "You've been asking for this film ever since I announced there would be a Historians At The Movies Podcast. Today we jump in head first to the Director's Cut of",
            'og:locale': 'en_US',
            'apple:content_id': '1000619359169',
            'og:url':
              'https://podcasts.apple.com/us/podcast/episode-32-kingdom-of-heaven-with-david-perry/id1658432453?i=1000619359169',
          },
        ],
        cse_image: [
          {
            src: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/97/c1/ab/97c1ab98-12d1-4fa8-f143-dfc5802199a5/mza_12812486687250876079.jpg/1200x1200ECA.PESS01-60.jpg?imgShow=Podcasts211/v4/61/4c/26/614c2694-661c-734a-e13c-35ac53633dc4/mza_7200875358157761330.jpg',
          },
        ],
      },
    },
    {
      kind: 'customsearch#result',
      title:
        'Caring for the Kingdom of Heaven - Working Preacher from Luther ...',
      htmlTitle:
        'Caring for the \u003cb\u003eKingdom of Heaven\u003c/b\u003e - Working Preacher from Luther ...',
      link: 'https://www.workingpreacher.org/dear-working-preacher/caring-for-the-kingdom-of-heaven',
      displayLink: 'www.workingpreacher.org',
      snippet:
        "Oct 1, 2017 ... We are on lease from God to care for God's people, to care for God's creation, to care for the Kingdom of Heaven with the Beatitudes as our gardening tools.",
      htmlSnippet:
        'Oct 1, 2017 \u003cb\u003e...\u003c/b\u003e We are on lease from God to care for God&#39;s people, to care for God&#39;s creation, to care for the \u003cb\u003eKingdom of Heaven\u003c/b\u003e with the Beatitudes as our gardening tools.',
      formattedUrl:
        'https://www.workingpreacher.org/dear.../caring-for-the-kingdom-of-heave...',
      htmlFormattedUrl:
        'https://www.workingpreacher.org/dear.../caring-for-the-\u003cb\u003ekingdom-of-heave\u003c/b\u003e...',
      pagemap: {
        cse_thumbnail: [
          {
            src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLTbl4bCPqmbiux3BpGpgRLCz2Vmr1JUmbmh2Wy_Q56-dxMC0lXfVb6iZ3&s',
            width: '225',
            height: '225',
          },
        ],
        metatags: [
          {
            'og:image':
              'https://www.workingpreacher.org/wp-content/uploads/2020/06/20069038984_00a2054c6c_k_o_1brcpptos146k1nkmsf018db17aqc-original.jpg',
            'og:type': 'article',
            'article:published_time': '2017-10-01T15:17:00+00:00',
            'og:image:width': '2048',
            'twitter:card': 'summary_large_image',
            'og:site_name': 'Working Preacher from Luther Seminary',
            author: 'Ben McDonald Coltvet',
            'og:title':
              'Caring for the Kingdom of Heaven - Working Preacher from Luther Seminary',
            'og:image:height': '2048',
            'twitter:label1': 'Written by',
            'twitter:label2': 'Est. reading time',
            'og:image:type': 'image/jpeg',
            'msapplication-tileimage':
              'https://www.workingpreacher.org/wp-content/uploads/2020/11/cropped-WP_favicon2_512px-270x270.jpg',
            'og:description':
              'So, how are we doing taking care of that vineyard these days? Before we start casting shame and blame on the easy targets in this story and on those around us in our lives, we should take a long hard look at ourselves. Just how are we doing in our tending of the Kingdom of … Continue reading "Caring for the Kingdom of Heaven"',
            'twitter:data1': 'Ben McDonald Coltvet',
            'twitter:data2': '4 minutes',
            'article:modified_time': '2023-10-03T14:09:27+00:00',
            viewport: 'width=device-width, initial-scale=1',
            'og:locale': 'en_US',
            'og:url':
              'https://www.workingpreacher.org/dear-working-preacher/caring-for-the-kingdom-of-heaven',
          },
        ],
        cse_image: [
          {
            src: 'https://www.workingpreacher.org/wp-content/uploads/2020/06/20069038984_00a2054c6c_k_o_1brcpptos146k1nkmsf018db17aqc-original.jpg',
          },
        ],
      },
    },
    {
      kind: 'customsearch#result',
      title: 'The Kingdom of Heaven Is a Treasure | Desiring God',
      htmlTitle:
        'The \u003cb\u003eKingdom of Heaven\u003c/b\u003e Is a Treasure | Desiring God',
      link: 'https://www.desiringgod.org/messages/the-kingdom-of-heaven-is-a-treasure',
      displayLink: 'www.desiringgod.org',
      snippet:
        "Nov 20, 2005 ... It's not hard to see why that is so valuable. If the omnipotent, all-wise God is ruling over all things for your joy, everything must be working ...",
      htmlSnippet:
        'Nov 20, 2005 \u003cb\u003e...\u003c/b\u003e It&#39;s not hard to see why that is so valuable. If the omnipotent, all-wise God is ruling over all things for your joy, everything must be working&nbsp;...',
      formattedUrl:
        'https://www.desiringgod.org/messages/the-kingdom-of-heaven-is-a-treasure',
      htmlFormattedUrl:
        'https://www.desiringgod.org/messages/the-\u003cb\u003ekingdom-of-heaven\u003c/b\u003e-is-a-treasure',
      pagemap: {
        cse_thumbnail: [
          {
            src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyEGpHbzspb4kp4w_s-_Y46SmyXfwt4UkYrXcR71DrGWiOuOBJiaaJ1cRG&s',
            width: '310',
            height: '163',
          },
        ],
        metatags: [
          {
            'p:domain_verify': 'ef4cefa7bbe488db0cca8f4d6a9be146',
            'og:image':
              'https://www.desiringgod.org/assets/2/social/dg_logo_facebook_fallback-1b7a5ed0b26ad75e6bffa6faeb1be2784b7d189a0b13c4d2c7287b4dda2d71ab.png',
            'og:type': 'article',
            'twitter:title': 'The Kingdom of Heaven Is a Treasure',
            'twitter:card': 'summary',
            'article:published_time': '2005-11-20',
            'article:section': 'Sermons',
            'og:site_name': 'Desiring God',
            'og:title': 'The Kingdom of Heaven Is a Treasure',
            'csrf-param': 'authenticity_token',
            'og:updated_time': '2025-01-23T00:45:49Z',
            'og:description':
              'The kingdom of God is so valuable that losing everything on earth, but getting the kingdom, is a happy trade-off.',
            'twitter:creator': '@JohnPiper',
            'article:publisher': 'https://www.facebook.com/DesiringGod',
            'article:author': 'https://www.facebook.com/JohnPiper',
            'twitter:image':
              'https://www.desiringgod.org/assets/2/social/dg_logo_facebook_fallback-1b7a5ed0b26ad75e6bffa6faeb1be2784b7d189a0b13c4d2c7287b4dda2d71ab.png',
            'twitter:site': '@desiringGod',
            'article:modified_time': '2025-01-23T00:45:49Z',
            viewport:
              'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
            'twitter:description':
              'The kingdom of God is so valuable that losing everything on earth, but getting the kingdom, is a happy trade-off.',
            'csrf-token': 'haaB_ykMQhJUmuDdDc9aSjqoVf-EUvKR46xRU8gj_4Y',
            'og:url':
              'https://www.desiringgod.org/messages/the-kingdom-of-heaven-is-a-treasure',
          },
        ],
        cse_image: [
          {
            src: 'https://www.desiringgod.org/assets/2/social/dg_logo_facebook_fallback-1b7a5ed0b26ad75e6bffa6faeb1be2784b7d189a0b13c4d2c7287b4dda2d71ab.png',
          },
        ],
      },
    },
    {
      kind: 'customsearch#result',
      title: 'The Kingdom of Heaven Belongs to Such as These',
      htmlTitle:
        'The \u003cb\u003eKingdom of Heaven\u003c/b\u003e Belongs to Such as These',
      link: 'https://www.carmelitedcj.org/news/blog/358-the-kingdom-of-heaven-belongs-to-such-as-these',
      displayLink: 'www.carmelitedcj.org',
      snippet:
        "Jesus said: “Let the little children come to me and do not prevent them for the Kingdom of Heaven belongs to such as these.” He didn't say to show them the way, ...",
      htmlSnippet:
        'Jesus said: “Let the little children come to me and do not prevent them for the \u003cb\u003eKingdom of Heaven\u003c/b\u003e belongs to such as these.” He didn&#39;t say to show them the way,&nbsp;...',
      formattedUrl:
        'https://www.carmelitedcj.org/.../358-the-kingdom-of-heaven-belongs-to-su...',
      htmlFormattedUrl:
        'https://www.carmelitedcj.org/.../358-the-\u003cb\u003ekingdom-of-heaven\u003c/b\u003e-belongs-to-su...',
      pagemap: {
        cse_thumbnail: [
          {
            src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkWqP3jve2GBr9nGEyye5x6P67N_LpcnFugGMo3189nrayZ83b_hcInnrE&s',
            width: '275',
            height: '183',
          },
        ],
        metatags: [
          {
            'og:image':
              'https://www.carmelitedcj.org/images/stories/sisters/news/2018-CGS-Photos-3015_preview-003.jpeg',
            'twitter:card': 'summary_large_image',
            'twitter:title': 'The Kingdom of Heaven Belongs to Such as These',
            'og:type': 'article',
            'og:site_name': 'St. Agnes Home',
            viewport: 'width=device-width, initial-scale=1.0',
            'twitter:description':
              'The Carmelite Sisters of the Divine Heart of Jesus and our dedicated staff at St. Agnes Home strive to provide a real HOME for seniors where they can enjoy life lighted up by peace and warmed by His Love.',
            author: 'Sr. Mary Michael',
            'og:title': 'The Kingdom of Heaven Belongs to Such as These',
            'og:url':
              'https://www.carmelitedcj.org/news/blog/358-the-kingdom-of-heaven-belongs-to-such-as-these',
            'og:description':
              'The Carmelite Sisters of the Divine Heart of Jesus and our dedicated staff at St. Agnes Home strive to provide a real HOME for seniors where they can enjoy life lighted up by peace and warmed by His Love.',
            'twitter:image':
              'https://www.carmelitedcj.org/images/stories/sisters/news/2018-CGS-Photos-3015_preview-003.jpeg',
          },
        ],
        cse_image: [
          {
            src: 'https://www.carmelitedcj.org/images/stories/sisters/news/2018-CGS-Photos-3015_preview-003.jpeg',
          },
        ],
        article: [
          {
            articlebody:
              'By: Sr. M. John Paul “Shh! We need to be quiet to listen to Jesus!” Isaac exclaimed as other 3 year old voices could be heard disturbing the silence which had settled upon the room. I smiled...',
            inlanguage: 'en-GB',
            name: 'The Kingdom of Heaven Belongs to Such as These',
          },
        ],
      },
    },
  ],
}
