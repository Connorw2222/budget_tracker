let db; 
// new database request
const request = indexedDB.open('buget',1);

request.onupgradeneeded = function (event){
    const db = event.target.result;
    db.createObjectStore('pending', {autoIncrement: true});
}

request.onsuccess = function(event){
    db=event.target.result;

    if (navigator.onLine){
        checkDb();
    }
};

request.onerror = (event)=>{
    console.log("error" + event.target.errorCode);
};

function saveRecord(record){
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore('pending')

    store.add(record);
}

function checkDb(){
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore('pending')
    const getAll = store.getAll();

    getAll.onsuccess = ()=>{
        if (getAll.result.length > 0){
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept : "application/json, text/plain, */*", 
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(()=>{
                const transaction = db.transaction(["pending"],"readwrite");
                const store = transaction.objectStore("pending");
                store.clear();
            });
        }
    };
}

window.addEventListener("online", checkDb)
