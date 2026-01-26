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

	exePath, err := os.Executable()
	if err == nil {
		exeDir := filepath.Dir(exePath)
		os.Chdir(exeDir)
	}

	if isAppRunning(AppPort) {

		openBrowser(AppURL)
		return
	}
	if len(os.Args) == 1 {
		log.Println("Iniciando sistema...")

		cmd := exec.Command(exePath, "serve", "--http=127.0.0.1:"+AppPort)

		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		cmd.Stdin = os.Stdin

		if err := cmd.Run(); err != nil {
			log.Printf("El servidor se cerró con error: %v\n", err)
		}

		// PAUSA FINAL: Si el server muere, la ventana NO se cierra
		fmt.Println("\n------------------------------------------------")
		fmt.Println("La aplicación ha finalizado.")
		fmt.Println("Presiona ENTER para cerrar esta ventana...")
		fmt.Scanln()
		return
	}

	app := pocketbase.New()

	app.OnServe().BindFunc(func(e *core.ServeEvent) error {

		e.Router.POST("/api/generar-deudas", func(c *core.RequestEvent) error {

			data := struct {
				PeriodoID string `json:"periodo_id"`
			}{}

			if err := c.BindBody(&data); err != nil {
				return apis.NewBadRequestError("Falta el periodo_id o el JSON es inválido", err)
			}

			// Buscar matrículas activas
			records, err := app.FindRecordsByFilter("matriculas", "activo = true", "-created", 1000, 0)
			if err != nil {
				return apis.NewApiError(500, "Error buscando matrículas", err)
			}

			generados := 0
			cargosCollection, err := app.FindCollectionByNameOrId("cargos")
			if err != nil {
				return apis.NewApiError(500, "No se encontró la colección cargos", err)
			}

			for _, matricula := range records {
				atletaID := matricula.GetString("atleta_id")
				claseID := matricula.GetString("clase_id")

				// Evitar duplicados
				existe, _ := app.FindRecordsByFilter(
					"cargos",
					"matricula_id = {:mat} && periodo_id = {:per}",
					"-created", 1, 0,
					map[string]interface{}{"mat": matricula.Id, "per": data.PeriodoID},
				)

				if len(existe) > 0 {
					continue
				}

				clase, err := app.FindRecordById("clases", claseID)
				if err != nil {
					continue
				}

				concepto, err := app.FindRecordById("conceptos", clase.GetString("concepto_id"))
				if err != nil {
					continue
				}

				cargo := core.NewRecord(cargosCollection)
				cargo.Set("atleta_id", atletaID)
				cargo.Set("concepto_id", concepto.Id)
				cargo.Set("periodo_id", data.PeriodoID)
				cargo.Set("matricula_id", matricula.Id)
				cargo.Set("monto_total", concepto.GetFloat("precio"))
				cargo.Set("estado", "pendiente")

				if err := app.Save(cargo); err == nil {
					generados++
				}
			}

			return c.JSON(200, map[string]interface{}{
				"message":          "Proceso completado",
				"cargos_generados": generados,
			})
		})

		// Servir Frontend
		e.Router.GET("/{path...}", apis.Static(os.DirFS("./pb_public"), true))

		// Abrir navegador (solo lo hace el subproceso)
		go func() {
			time.Sleep(1 * time.Second)
			openBrowser(AppURL)
		}()

		return e.Next()
	})

	if err := app.Start(); err != nil {
		log.Println("Error interno de PocketBase:", err)
		os.Exit(1)
	}
}

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
