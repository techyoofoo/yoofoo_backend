
db = connect("rogue_app");

db.permissions.dropIndexes();
db.permissions.drop();


db.permissions.save(
    [
       {
    _id: "view",
    name: "view",
    state: "enable"
  },
  {
    _id: "create",
    name: "create",
    state: "enable"
  },
  {
    _id: "edit",
    name: "edit",
    state: "enable"
  },
  {
    _id: "delete",
    name: "delete",
    state: "enable"
  },
  {
    _id: "execute",
    name: "execute",
    state: "enable"
  }
    ]
);
