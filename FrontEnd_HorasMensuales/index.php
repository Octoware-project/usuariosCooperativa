<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Horas Mensuales</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <div class="header-left">
            <a href="/CooperativaESI/Aplicacion/FrontEnd_Residentes_Cooperativa/index.php">
                <img src="img/Logo.jpg" alt="Logo" class="logo" style="cursor: pointer;">
            </a>
        </div>
        <div class="header-center">
            <input id="BtnNovedades" class="Button" type="button" value="Novedades">
            <input id="BtnHorasMensuales" class="Button" type="button" value="Horas Mensuales" onclick="location.href='/CooperativaESI/Aplicacion/FrontEnd_HorasMensuales/index.php'">
            <input id="BtnRecibos" class="Button" type="button" value="Recibos">
            <input id="BtnSobreNosotros" class="Button" type="button" value="Sobre Nosotros">
        </div>
        <div class="header-right">
                        <a href="/CooperativaESI/Aplicacion/FrontEnd_DatosUsuarios/index.php">
                <img src="img/UserIconEjemplo.png" alt="Usuario" class="user-icon">
            </a>
        </div>
    </header>

    <div class="Principal">
      <div class="AgregarHoras">
        <div class="Container">
          <div class="AH_Left">
            <h2>Horas Mensuales: </h2>
          </div>
          <div class="AH_Right">
            <input type="button" value="Agregar Horas" class="AgregarHorasButton">
          </div>
        </div>
        <table class="tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Horas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>18/06/25</td>
                  <td></td>
                  <td>
                    <button class="btn eliminar">Eliminar</button>
                    <button class="btn editar">Editar</button>
                  </td>
                </tr>
                <tr>
                  <td>18/06/25</td>
                  <td></td>
                  <td>
                    <button class="btn eliminar">Eliminar</button>
                    <button class="btn editar">Editar</button>
                  </td>
                </tr>
                <tr>
                  <td>18/06/25</td>
                  <td></td>
                  <td>
                    <button class="btn eliminar">Eliminar</button>
                    <button class="btn editar">Editar</button>
                  </td>
                </tr>
              </tbody>
        </table>
      </div>
    </div>
</body>
</html>