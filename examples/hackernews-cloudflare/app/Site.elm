module Site exposing (canonicalUrl, config)

import DataSource exposing (DataSource)
import Head
import SiteConfig exposing (SiteConfig)


config : SiteConfig
config =
    { canonicalUrl = canonicalUrl
    , head = head
    }


canonicalUrl : String
canonicalUrl =
    "https://hacker-news-elm-pages.netlify.app"


head : DataSource (List Head.Tag)
head =
    []
        |> DataSource.succeed
