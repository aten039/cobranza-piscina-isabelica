

export default function DashboardPages() {
  return (
    <div>
        
        <h1 className="text-4xl font-titulo text-center uppercase font-black mb-4">Sistema de gestion de cobranzas</h1>
      
      <div className=" flex justify-around mb-4">
        <div className=" p-4 border rounded-lg mr-2">
          <h2 className="text-xl font-semibold mb-2">Lista de Atletas activos</h2>
        </div>
        <div className=" p-4 border rounded-lg mr-2">
          <h2 className="text-xl font-semibold mb-2">Lista de Atletas deudores</h2>
        </div>
        <div className=" p-4 border rounded-lg mr-2">
          <h2 className="text-xl font-semibold mb-2">Lista de profesores</h2>
        </div>
        <div className=" p-4 border rounded-lg mr-2">
          <h2 className="text-xl font-semibold mb-2">Lista de pagos sin consilar</h2>
        </div>
      </div></div>
  )
}
