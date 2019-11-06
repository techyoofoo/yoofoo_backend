
db = connect("rogue_app");

db.permissions.dropIndexes();
db.permissions.drop();


db.permissions.save(
    [
        {
            _id: ObjectId("5dc1472491aee6e859ce1110"),
            name: "read",
            state: "enable"
        },
        {
            _id: ObjectId("5dc1472491aee6e859ce1111"),
            name:"create",
            state:"enable"
        },
        {
            _id: ObjectId("5dc1472491aee6e859ce1112"),
            name:"update",
            state:"enable"
        },
        {
            _id:ObjectId("5dc1472491aee6e859ce1113"),
            name:"delete",
            state:"enable"
         }   
    ]
);
