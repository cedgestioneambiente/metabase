(ns metabase.db.setup-test
  (:require
   [clojure.java.jdbc :as jdbc]
   [clojure.test :refer :all]
   [metabase.db.connection :as mdb.connection]
   [metabase.db.data-source :as mdb.data-source]
   [metabase.db.liquibase :as liquibase]
   [metabase.db.setup :as mdb.setup]
   [metabase.driver :as driver]
   [metabase.test :as mt]
   [toucan2.core :as t2]))

(set! *warn-on-reflection* true)

(deftest verify-db-connection-test
  (testing "Should be able to verify a DB connection"
    (testing "from a jdbc-spec map"
      (#'mdb.setup/verify-db-connection :h2 (mdb.data-source/broken-out-details->DataSource
                                             :h2
                                             {:subprotocol "h2"
                                              :subname     (format "mem:%s" (mt/random-name))
                                              :classname   "org.h2.Driver"})))
    (testing "from a connection URL"
      (#'mdb.setup/verify-db-connection :h2 (mdb.data-source/raw-connection-string->DataSource
                                             (format "jdbc:h2:mem:%s" (mt/random-name)))))))

(deftest setup-db-test
  (testing "Should be able to set up an arbitrary application DB"
    (letfn [(test* [data-source]
              (is (= :done
                     (mdb.setup/setup-db! :h2 data-source true)))
              (is (= ["Administrators" "All Users"]
                     (mapv :name (jdbc/query {:datasource data-source}
                                             "SELECT name FROM permissions_group ORDER BY name ASC;")))))]
      (let [subname (format "mem:%s;DB_CLOSE_DELAY=10" (mt/random-name))]
        (testing "from a jdbc-spec map"
          (test* (mdb.data-source/broken-out-details->DataSource
                  :h2
                  {:subprotocol "h2"
                   :subname     subname
                   :classname   "org.h2.Driver"})))
        (testing "from a connection URL"
          (test* (mdb.data-source/raw-connection-string->DataSource
                  (str "jdbc:h2:" subname))))))))

(deftest setup-fresh-db-test
  (mt/test-drivers #{:h2 :mysql :postgres}
    (testing "can setup a fresh db"
      (mt/with-temp-empty-app-db [_conn driver/*driver*]
        (is (= :done
               (mdb.setup/setup-db! driver/*driver* (mdb.connection/data-source) true)))))))

(deftest setup-a-mb-instance-running-version-lower-than-45
  (mt/test-drivers #{:h2 :mysql :postgres}
    (mt/with-temp-empty-app-db [conn driver/*driver*]
      (with-redefs [liquibase/decide-liquibase-file (fn [& _args] @#'liquibase/changelog-legacy-file)]
        ;; set up a db in a way we have a MB instance running metabase 42
        (liquibase/with-liquibase [liquibase conn]
          (.update liquibase 381 ""))
        (is (= "v42.00-071"
               (t2/select-one-pk :databasechangelog {:order-by [[:dateexecuted :desc]]}))))

      (is (= :done
             (mdb.setup/setup-db! driver/*driver* (mdb.connection/data-source) true))))))

(deftest setup-a-mb-instance-running-version-greater-than-45
  (mt/test-drivers #{:h2 :mysql :postgres}
    (mt/with-temp-empty-app-db [conn driver/*driver*]
      (with-redefs [liquibase/decide-liquibase-file (fn [& _args] @#'liquibase/changelog-legacy-file)]
        ;; set up a db in a way we have a MB instance running metabase 45
        (liquibase/with-liquibase [liquibase conn]
          (.update liquibase 503 ""))
        (is (= "v45.00-057"
               (t2/select-one-pk :databasechangelog {:order-by [[:dateexecuted :desc]]}))))

      (is (= :done
             (mdb.setup/setup-db! driver/*driver* (mdb.connection/data-source) true))))))
