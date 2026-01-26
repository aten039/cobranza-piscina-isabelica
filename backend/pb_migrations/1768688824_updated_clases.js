/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1356382814")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3066534628",
    "hidden": false,
    "id": "relation1340673243",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "entrenador_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_343751955",
    "hidden": false,
    "id": "relation1230631354",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "horario_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1356382814")

  // remove field
  collection.fields.removeById("relation1340673243")

  // remove field
  collection.fields.removeById("relation1230631354")

  return app.save(collection)
})
