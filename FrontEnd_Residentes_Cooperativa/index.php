<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles.css">
    <title>ESI COOP</title>
</head>
<body >
    <header>
        <div class="header-left">
            <a href="/CooperativaESI/Aplicacion/FrontEnd_Residentes_Cooperativa/index.php">
                <img src="img/Logo.jpg" alt="Logo" class="logo" style="cursor: pointer;">
            </a>
        </div>
        <div class="header-center">
            <input id="BtnNovedades" class="headerButton" type="button" value="Novedades" >
            <input id="BtnHorasMensuales" class="headerButton" type="button" value="Horas Mensuales" onclick="location.href='/CooperativaESI/Aplicacion/FrontEnd_HorasMensuales/index.php'">
            <input id="BtnRecibos" class="headerButton" type="button" value="Recibos">
            <input id="BtnSobreNosotros" class="headerButton" type="button" value="Sobre Nosotros">
        </div>
        <div class="header-right">
                      <a href="/CooperativaESI/Aplicacion/FrontEnd_DatosUsuarios/index.php">
                <img src="img/UserIconEjemplo.png" alt="Usuario" class="user-icon">
            </a>
        </div>
    </header>

    <div class="Ventanas">
        <div class="Principal">
            <div class="Evolucion">
            <h2>Evolución</h2>
            <div class="ImgEvolucion">
                <img src="img/ImagenEjemplo.jpg" alt="">
                <img src="img/ImagenEjemplo.jpg" alt="">
                <img src="img/ImagenEjemplo.jpg" alt="">
            </div>

            </div>
            <div class="MyV">

                <div class="Mision">
                    <h2>Mision</h2>  
                    <div class="MisionTextBox"></div> 
                </div>
                <div class="Vision">
                    <h2>Vision</h2>
                    <div class="VisionTextBox">

                    </div>    
                </div>
            </div>
        </div>
        
        <div class="Lateral">
            <h2>Novedades</h2>
            <div class="Novedades">

            </div>
            <h2>Horas Mensuales</h2>
            <div class="HorasMensuales">

            </div>
            <h2>Recibos</h2>
            <div class="Recibos">

            </div>
        </div>
    </div>
</body>
</html>