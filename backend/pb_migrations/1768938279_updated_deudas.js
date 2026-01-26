/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3803390126")

  // update collection data
  unmarshal({
    "name": "cargos"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3803390126")

  // update collection data
  unmarshal({
    "name": "deudas"
  }, collection)

  return app.save(collection)
})
