module Route.Counter exposing (Data, Model, Msg, route)

import Browser.Navigation
import DataSource exposing (DataSource)
import Effect exposing (Effect)
import Head
import Head.Seo as Seo
import Html.Styled as Html
import Http
import Pages.Effect
import Pages.PageUrl exposing (PageUrl)
import Pages.Url
import Path exposing (Path)
import RouteBuilder exposing (StatefulRoute, StatelessRoute, StaticPayload)
import Shared
import View exposing (View)


type alias Model =
    { count : Maybe Int
    }


type Msg
    = NoOp
    | GotStargazers (Result Http.Error Int)


type alias RouteParams =
    {}


route : StatefulRoute RouteParams Data Model Msg
route =
    RouteBuilder.single
        { head = head
        , data = data
        }
        |> RouteBuilder.buildWithLocalState
            { view = view
            , update = update
            , subscriptions = subscriptions
            , init = init
            }


init :
    Maybe PageUrl
    -> Shared.Model
    -> StaticPayload Data RouteParams
    -> ( Model, Pages.Effect.Effect Msg (Effect Msg) )
init maybePageUrl sharedModel static =
    ( { count = Nothing }
    , Effect.GetStargazers GotStargazers
        |> Pages.Effect.custom
    )


update :
    PageUrl
    -> Shared.Model
    -> StaticPayload Data RouteParams
    -> Msg
    -> Model
    -> ( Model, Pages.Effect.Effect Msg (Effect Msg) )
update pageUrl sharedModel static msg model =
    case msg of
        NoOp ->
            ( model, Pages.Effect.none )

        GotStargazers (Ok count) ->
            ( { count = Just count }, Pages.Effect.none )

        GotStargazers (Err error) ->
            ( model, Pages.Effect.none )


subscriptions : Maybe PageUrl -> RouteParams -> Path -> Shared.Model -> Model -> Sub Msg
subscriptions maybePageUrl routeParams path sharedModel model =
    Sub.none


type alias Data =
    {}


data : DataSource Data
data =
    DataSource.succeed Data


head :
    StaticPayload Data RouteParams
    -> List Head.Tag
head static =
    Seo.summary
        { canonicalUrlOverride = Nothing
        , siteName = "elm-pages"
        , image =
            { url = Pages.Url.external "TODO"
            , alt = "elm-pages logo"
            , dimensions = Nothing
            , mimeType = Nothing
            }
        , description = "TODO"
        , locale = Nothing
        , title = "Counter"
        }
        |> Seo.website


view :
    Maybe PageUrl
    -> Shared.Model
    -> Model
    -> StaticPayload Data RouteParams
    -> View Msg
view maybeUrl sharedModel model static =
    { title = "Counter"
    , body =
        [ case model.count of
            Nothing ->
                Html.text "Loading..."

            Just count ->
                Html.text ("The count is: " ++ String.fromInt count)
        ]
    }
