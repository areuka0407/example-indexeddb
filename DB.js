class DB {
    constructor(db_name, version, migrations){
        this.db_name = db_name;
        this.db_version = version;
        this.migrations = migrations;
        this.context = null;
    }

    connectDB(){
        return new Promise((res, rej) => {
            let request = indexedDB.open(this.db_name, this.version);

            /* 마이그레이션 작성 */
            request.onupgradeneeded = () => this.createDB(request.result);

            request.onerror = err => rej(err);
            request.onsuccess = e => {
                this.context = request.result;
                res(e);
            }
        });
    };


    connectTransaction(storeName, status){
        if(this.context === null) console.error("DB가 존재하지 않습니다. DB는 connectDB의 Promise가 완료되어야 사용할 수 있습니다.");
        else return this.context.transaction(storeName, status).objectStore(storeName, status);
    }

    
    createDB(db){
        this.migrations.forEach(m => {
            let {storeName, indexes} = m;
            let newStore = db.createObjectStore(storeName, {keyPath: "id", autoIncrement: true});
            indexes.forEach(index => {
                newStore.createIndex(index, index, {unique: false});
            });
        });
    }

    fetchAll(storeName){
        return new Promise((res, rej) => {
            let returned = [];
            let store = this.connectTransaction(storeName, "readonly");
            let req = store.openCursor();

            req.onsuccess = e => {
                const cursor = e.target.result;
                if(cursor){
                    req = store.get(cursor.key);
                    req.onsuccess = e => {
                        const value = e.target.result;
                        returned.push(value);
                    }
                    cursor.continue();
                }
                cursor || res(returned);
            };

            req.onerror = err => rej(err);
        });
    }

    insert(storeName, data){
        return new Promise((res, rej) => {
            let store = this.connectTransaction(storeName, "readwrite");
            let request = store.add(data);
            request.onsuccess = function(e){
                console.log("입력 성공!", e);
                res(e);
            }
            request.onerror = function(e){
                console.error("입력 실패...", e);
                rej(e);
            }
        });
    }   

    delete(storeName, id){
        return new Promise((res, rej) => {
            let store = this.connectTransaction(storeName, "readwrite");
            let req = store.delete(id);
            req.onsuccess = e => {
                console.log("데이터 삭제!", e);
                res(e);
            }
            req.onerror = err => {
                console.error("삭제 실패...", err);
                rej(err);
            }
        });
    }
}