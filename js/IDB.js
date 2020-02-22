class IDB  {
    constructor(name, tables = []){
        this.db = null;
        
        let req = indexedDB.open(name);
        req.onupgradeneeded = e => {
            let tempDB = req.result;
            tables.forEach(table => {
                tempDB.createObjectStore(table, {keyPath: "id", autoIncrement: true});
            });
        };
        req.onsuccess = e => {
            IDB.db = this.db = req.result;
        }
    }

    add(table, data){
        let os = this.db.transaction(table, "readwrite").objectStore(table);
        os.add(data);
    }

    getItem(table, id){
        let os = this.db.transaction(table, "readwrite").objectStore(table);
        let req = os.get(id);
        return new Promise(res => {
            req.onsuccess = e => {
                res(req.result);
            };
        });
    }

    getList(table){
        let os = this.db.transaction(table, "readwrite").objectStore(table);
        let req = os.getAll();
        return new Promise(res => {
            req.onsuccess = e => {
                res(req.result);
            };
        });
    }

    delete(table, id){
        let os = this.db.transaction(table, "readwrite").objectStore(table);
        os.delete(id);
    }   

    update(table, data){
        let os = this.db.transaction(table, "readwrite").objectStore(table);
        os.put(data);
    }
}