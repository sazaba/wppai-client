// src/app/login/page.tsx

export default function LoginPage() {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md p-6 bg-white shadow-md rounded-lg">
          <h1 className="text-2xl font-semibold mb-4 text-center">Iniciar sesión</h1>
          <form className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Correo electrónico"
              className="border px-4 py-2 rounded w-full"
            />
            <input
              type="password"
              placeholder="Contraseña"
              className="border px-4 py-2 rounded w-full"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    )
  }
  