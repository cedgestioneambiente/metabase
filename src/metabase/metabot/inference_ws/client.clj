(ns metabase.metabot.inference-ws.client
  (:require
    [clj-http.client :as http]
    [clojure.data.json :as json]
    [clojure.walk :as walk]
    [malli.core :as mc]
    [metabase.metabot.settings :as metabot-settings]
    [metabase.metabot.schema :as metabot-schema]
    [metabase.util.log :as log]))

(def embeddings-schema
  (mc/schema
    [:map-of :string :string]))

(def embeddings-return-schema
  (mc/schema
    [:map-of :string [:vector float?]]))

(mc/validate embeddings-schema {"A" "esafs"})
(mc/validate embeddings-return-schema {"A" [1.0]})

(defn ^:dynamic bulk-embeddings
  "Convert the input map of {obj-str encoding} to a map of {obj-str embedding (a vector of floats)}."
  ([endpoint obj-strs->encodings]
   (let [request {:method       :post
                  :url          (format "%s/api/bulkEmbed" endpoint)
                  :body         (json/write-str {:input obj-strs->encodings})
                  :content-type :json}
         {:keys [body status]} (http/request request)]
     (when (= 200 status)
       (get (json/read-str body) "embeddings"))))
  ([obj-strs->encoddings]
   (bulk-embeddings
     (metabot-settings/metabot-inference-ws-url)
     obj-strs->encoddings)))

(defn keywordize-types
  [mbql]
  (walk/postwalk (fn [x]
                   (if (and (instance? clojure.lang.MapEntry x)
                            (= (key x) :base-type))
                     [(key x) (keyword (val x))]
                     x))
                 mbql))

(defn ^:dynamic infer
  "Infer LLM output from a provided prompt and context.

  The prompt is the user prompt and the context is a machine-generated
  description of the data to be used when performing inferencing. Ideally, this
  data will be a single dataset (model or table), but multiple datasets can be
  provided. In this latter case, the expectation is that the LLM will know how
  to select the best single dataset if it doesn't know how to do joins or that
  it will select and join as desired from the provided datasets to provide the
  final answer."
  ([endpoint {:keys [prompt context models] :as args}]
   {:pre [prompt context (mc/validate metabot-schema/inference-schema args)]}
   (log/info "Context will not be passed to inferencer any more.")
   (let [request-body {:prompt prompt
                       ;:context          context
                       :models models}
         request      {:method           :post
                       :url              (format "%s/api/inferMBQL" endpoint)
                       :body             (json/write-str request-body)
                       :as               :json
                       :content-type     :json
                       :throw-exceptions false}
         {:keys [body status]} (http/request request)]
     (when (= 200 status)
       (keywordize-types body))))
  ([prompt-data]
   (infer
     (metabot-settings/metabot-inference-ws-url)
     prompt-data)))