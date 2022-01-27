module Request.Fauna exposing (dataSource, mutationDataSource)

import DataSource exposing (DataSource)
import DataSource.Http
import Graphql.Document
import Graphql.Operation exposing (RootMutation, RootQuery)
import Graphql.SelectionSet exposing (SelectionSet)
import Json.Encode as Encode
import Secrets


dataSource : String -> SelectionSet value RootQuery -> DataSource value
dataSource timeStamp selectionSet =
    DataSource.Http.unoptimizedRequest
        (Secrets.succeed
            { url =
                faunaUrl
                    -- for now, this timestamp invalidates the dev server cache
                    -- it would be helpful to have a way to mark a DataSource as uncached. Maybe only allow
                    -- from server-rendered pages?
                    ++ "?time="
                    ++ timeStamp
            , method = "POST"
            , headers = [ ( "authorization", faunaAuthValue ) ]
            , body =
                DataSource.Http.jsonBody
                    (Encode.object
                        [ ( "query"
                          , selectionSet
                                |> Graphql.Document.serializeQuery
                                |> Encode.string
                          )
                        ]
                    )
            }
        )
        (selectionSet
            |> Graphql.Document.decoder
            |> DataSource.Http.expectUnoptimizedJson
        )


mutationDataSource : String -> SelectionSet value RootMutation -> DataSource value
mutationDataSource timeStamp selectionSet =
    DataSource.Http.unoptimizedRequest
        (Secrets.succeed
            { url = faunaUrl ++ "?time=" ++ timeStamp
            , method = "POST"
            , headers = [ ( "authorization", faunaAuthValue ) ]
            , body =
                DataSource.Http.jsonBody
                    (Encode.object
                        [ ( "query"
                          , selectionSet
                                |> Graphql.Document.serializeMutation
                                |> Encode.string
                          )
                        ]
                    )
            }
        )
        (selectionSet
            |> Graphql.Document.decoder
            |> DataSource.Http.expectUnoptimizedJson
        )


faunaUrl : String
faunaUrl =
    "https://graphql.us.fauna.com/graphql"


faunaAuthValue : String
faunaAuthValue =
    "Bearer fnAEdqJ_JdAAST7wRrjZj7NKSw-vCfE9_W8RyshZ"