import { useLogin } from "@/pages/login/hooks/useAuth"
import type React from "react"
import { Link } from "react-router-dom";

export default function LoginPage() {

    const {login, isLoading, error} = useLogin()

    
     const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);

      const data = Object.fromEntries(formData.entries());
      console.log(data);
      const credentials = {
        email:  data.email as string,
        password: data.password as string
      };
      login(credentials);
     };

  return (
    <>
      <div className=" bg-slate-100 min-h-screen flex items-center justify-center">
        <div className=" w-auto m-auto bg-white p-10 rounded-4xl shadow-md" > 

          <h1 className="mb-10 p-4 font-titulo font-black text-blue-800 text-4xl uppercase">Inicio de sesion</h1>
          <form onSubmit={handleLogin} className=" flex flex-col gap-12 ">
          
            <input className=" text-xl border-b-2 p-2 outline-none focus:ring-0 focus:border-blue-500"  type="email" id="email" name="email" required  placeholder="Correo electronico"/>
          

            <input className="text-xl border-b-2 p-2 outline-none focus:ring-0 focus:border-blue-500" type="password" id="password" name="password" required placeholder="Contraseña"/>
          
            <div className="flex justify-end">  
              <button className=" mt-8  w-fit px-4 bg-blue-700 uppercase font-bold text-white p-2 rounded text-xl cursor-pointer hover:bg-blue-800 transition-colors " type="submit" disabled={isLoading}>iniciar sesion</button>
            </div>
            <div> 
              <Link to="/register" className=" text-sm text-blue-600 ">registrar un nuevo usuario</Link>
              <p className=" mt-2 text-sm text-gray-500">¿Olvidaste tu contraseña? Contacta al administrador.</p>

            </div>
            

          </form>
          {isLoading && <p>Loading...</p>}    
          {error && <p style={{color: 'red'}}>{error}</p>}
        </div>
      </div>
      
      


    </>
  )
}
