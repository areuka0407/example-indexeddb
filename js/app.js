class App {
    constructor() {
        this.idb = new IDB("areuka", ["students"]);
        this.i_name = document.querySelector("#name");
        this.i_email = document.querySelector("#email");
        this.i_age = document.querySelector("#age");
        this.i_image = document.querySelector("#image");

        this.$list = document.querySelector("#data-list");
        this.event();
        this.modifyId = null;
    }

    event(){
        document.querySelector("#btn-insert").addEventListener("click", this.insert);
        document.querySelector("#btn-modify").addEventListener("click", this.modify);
        document.querySelector("#btn-load").addEventListener("click", this.load);
        


        this.$list.addEventListener("click", e => {
            if(e.target.classList.contains("modify")){
                let id = e.target.dataset.id * 1;
                this.idb.getItem("students", id).then(item => {
                    this.modifyId = id;
                    this.i_name.value = item.name;
                    this.i_email.value = item.email;
                    this.i_age.value = item.age;
                });
            }
            else if(e.target.classList.contains("delete")){
                let id = e.target.dataset.id * 1;
                this.idb.delete("students", id);
                this.load();
            }
        });
    }

    insert = e => {
        this.getImageURL().then(url => {
            this.idb.add("students", {name: this.i_name.value, email: this.i_email.value, age: this.i_age.value, image: url});
            this.load();
        });
    };

    getImageURL(){
        return new Promise(resolve => {
            if(this.i_image.files.length ===  0) return "";
    
            let getImage = new Promise(res => {
                let file = this.i_image.files[0];
                let reader = new FileReader();
                reader.onload = () => res(reader.result);
                reader.readAsDataURL(file);
            });
    
            getImage.then(url => {
                let image = new Image();
                image.src = url;
                image.onload = () => {
                    let cropSize = 64; 
                    let canvas = document.createElement("canvas")
                        , ctx = canvas.getContext("2d")
                        , cx, cy, cw, ch; // crop x, y, w, h
                    canvas.width = cropSize;
                    canvas.height = cropSize;
    
                    if(image.width > image.height){
                        cw = ch = image.height; 
                        cx = (image.width - image.height) / 2;
                        cy = 0;
                    } else {
                        cw = ch = image.width;
                        cx = 0;
                        cy = (image.height - image.width) / 2;
                    }
                    ctx.drawImage(image, cx, cy, cw, ch, 0, 0, cropSize, cropSize);
                    resolve(canvas.toDataURL("image/jpg"));
                };
            });
        });
    }

    modify = e => {
        if(this.modifyId === null) return;
        this.idb.update("students", {id: this.modifyId, name: this.i_name.value, email: this.i_email.value, age: this.i_age.value});

        this.modifyId = null;
        this.i_name.value = this.i_age.value = this.i_email.value = "";
        this.load();
    };
    
    load = e => {
        this.idb.getList("students").then(data => {
            this.$list.innerHTML = "";
            data.forEach(x => {
                this.$list.append(this.dataTemplate(x));
            });
        });
    };
    
    dataTemplate({id, name, age, email, image}){
        let box = document.createElement("div");
        box.innerHTML = `<div class="list-group-item d-flex justify-content-between align-items-center">
                            <img src="${image}" alt="profile-image" width="64" height="64">
                            <div>
                                <b>${name}</b>
                                <small class="text-muted">${email}</small>
                            </div>
                            <div>
                            <span class="badge badge-primary p-2">${age}세</span>
                            <span data-id="${id}" class="modify badge badge-info p-2">수정하기</span>
                            <span data-id="${id}" class="delete badge badge-danger p-2">삭제하기</span>
                        </div>
                        </div>`;
        return box;
    }
}

window.onload = e => {
    let app = new App();
    
};



/**
 Class 를 사용하지 않은 방법


 let idb = null;
window.addEventListener("load", () => {
    let req = indexedDB.open("myDB", 1);

    // upgradeneeded 에 모든 구조를 작성해야한다. 작성된 후에는 구조를 수정할 수 없기 때문이다. (일회성)
    req.addEventListener("upgradeneeded", e => {
        let db = e.target.result;

        // db.createobjectStore( (string)"테이블 명", (object){ keyPath: (string)"Primary Key", autoIncrement: (bool)true/false }  )
        let created =  db.createObjectStore("students", {keyPath: 'id', autoIncrement: true});
        let dataList = [
            {name: "최선한", age: 39, email: "gondr99@gmail.com"}, 
            {name: "남혜란", age: 39, school: "수원정보과학고등학교"}, 
        ];
        created.transaction.oncomplete = e => {
            console.log(db);
            let transaction = db.transaction(["students"], "readwrite");
            let S_students = transaction.objectStore("students");

            dataList.forEach(data => {
                S_students.add(data) ;
            });
            
            transaction.oncomplete = e => {
                console.log("데이터 삽입 완료")
            }
        };
    });

    req.addEventListener("success", e => {
        idb = e.target.result;
    });



    document.querySelector("#btn-insert").addEventListener("click", e => {
        let name = document.querySelector("#name").value;
        let age = document.querySelector("#age").value;
        let email = document.querySelector("#email").value;
        
        let tr = idb.transaction("students", "readwrite");
        let os = tr.objectStore("students");

        os.add({name, age, email});
        tr.addEventListener("complete", () => {
            alert("데이터가 삽입되었습니다.");
        });
    });

    document.querySelector("#btn-load").addEventListener("click", e => {
        let tr = idb.transaction("students", "readwrite");
        let os = tr.objectStore("students");

        let req = os.getAll();
        let $list = document.querySelector("#data-list");
        
        req.onsuccess = () => {
            req.result.forEach(item => {
                $list.append(makeElem(item));
            });
        };
    });

    function makeElem({id, name, age, email}){
        let div = document.createElement("div");
        div.innerHTML = `<span class="id">${id}</span>
                        <span class="name">${name}</span>
                        <span class="age">${age}</span>
                        <span class="email">${email}</span>`;
        return div;
    }

    
    //let data = objectStore.get(no);
    //data.column = "updated"
    //objectStore.put(data);
    
});
*/