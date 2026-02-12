package main

import (
	"fmt"
	"log"
	"net"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"time"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

const (
	AppPort = "8090"
	AppURL  = "http://127.0.0.1:" + AppPort
)

func main() {
	// 1. Ajuste del directorio de trabajo
	exePath, err := os.Executable()
	if err == nil {
		exeDir := filepath.Dir(exePath)
		os.Chdir(exeDir)
	}

	// 2. Lógica "Desktop App" (Single Instance)
	if isAppRunning(AppPort) {
		openBrowser(AppURL)
		return
	}

	if len(os.Args) == 1 {
		log.Println("Iniciando sistema...")
		// Nota: en Windows a veces es mejor llamar al ejecutable sin extensión si falla,
		// pero exePath suele ser correcto.
		cmd := exec.Command(exePath, "serve", "--http=127.0.0.1:"+AppPort)
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		cmd.Stdin = os.Stdin

		if err := cmd.Run(); err != nil {
			log.Printf("El servidor se cerró con error: %v\n", err)
		}

		fmt.Println("\n------------------------------------------------")
		fmt.Println("La aplicación ha finalizado.")
		fmt.Println("Presiona ENTER para cerrar esta ventana...")
		fmt.Scanln()
		return
	}

	app := pocketbase.New()

	// 3. Configuración de Rutas y SPA (TODO DENTRO DE OnServe)
	app.OnServe().BindFunc(func(e *core.ServeEvent) error {

		// A. Servir archivos estáticos (Frontend) con soporte SPA
		// En v0.23+ se usa "{path...}" para capturar todo
		// El 'true' activa el fallback a index.html para rutas no encontradas (SPA)
		e.Router.GET("/{path...}", apis.Static(os.DirFS("./pb_public"), true))

		// B. Abrir el navegador automáticamente
		go func() {
			time.Sleep(1 * time.Second)
			openBrowser(AppURL)
		}()

		// IMPORTANTE: Debes retornar e.Next() para que el servidor continúe iniciando
		return e.Next()
	})

	if err := app.Start(); err != nil {
		log.Println("Error interno de PocketBase:", err)
		os.Exit(1)
	}
}

// --- Funciones Auxiliares ---

func openBrowser(url string) {
	var err error
	switch runtime.GOOS {
	case "linux":
		err = exec.Command("xdg-open", url).Start()
	case "windows":
		err = exec.Command("cmd", "/c", "start", url).Start()
	case "darwin":
		err = exec.Command("open", url).Start()
	}
	if err != nil {
		log.Printf("Error abriendo navegador: %v", err)
	}
}

func isAppRunning(port string) bool {
	timeout := 500 * time.Millisecond
	conn, err := net.DialTimeout("tcp", "127.0.0.1:"+port, timeout)
	if err != nil {
		return false
	}
	if conn != nil {
		conn.Close()
		return true
	}
	return false
}
