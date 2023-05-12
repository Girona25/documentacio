/**
 * Main
 */
let vant=0;
let vant1=0;
let vant2=0;
let vant3=0;
let vant4=0;
let vant9=0;
let vantjy=0;
let vantjx=0;
let vantamunt=0;
let vantavall=0;
let vantesquerra=0;
let vantdreta=0;
(function () {
    "use strict";

    // Imports
    let template = htmlLib.template;
    let qs = htmlLib.qs;

    // Currently visible controller
    let currentVisibleController = null;

    /**
     * Show a certain controller
     */
    function showController(n) {

        n = n | 0;

        console.log("Selecting gamepad " + n);

        let gamepads = document.querySelectorAll("#gamepad-container .gamepad");

        for (let i = 0; i < gamepads.length; i++) {
            let gp = gamepads[i];
            let index = gp.getAttribute("data-gamepad-index");

            index = index | 0;

            if (index == n) {
                gp.classList.remove('nodisp');
            } else {
                gp.classList.add('nodisp');
            }
        }

        currentVisibleController = n;
    }

    /**
     * Reconstruct the UI for the current gamepads
     */
    function rebuildUI() {

        // Handle gamepad selector button clicks
        function onButtonClick(ev) {
            let b = ev.currentTarget;
            let gpIndex = b.getAttribute('data-gamepad-index');

            showController(gpIndex);
        }

        let gp = navigator.getGamepads();

        let bbbox = qs("#button-bar-box");
        bbbox.innerHTML = '';

        let gpContainer = qs("#gamepad-container");
        gpContainer.innerHTML = '';

        let haveControllers = false, curControllerVisible = false, firstController = null;

        // For each controller, generate a button from the
        // button template, set up a click handler, and append
        // it to the button box
        for (let i = 0; i < gp.length; i++) {

            // Chrome has null controllers in the array
            // sometimes when nothing's plugged in there--ignore
            // them
            if (!gp[i] || !gp[i].connected) { continue; }

            let gpIndex = gp[i].index;

            // Clone the selector button
            let button = template("#template-button",
                {
                    "id": "button-" + gpIndex,
                    "data-gamepad-index": gpIndex,
                    "value": gpIndex
                });

            bbbox.appendChild(button);

            // Add the selector click listener
            button.addEventListener('click', onButtonClick);

            // Clone the main holder
            let gamepad = template("#template-gamepad",
                {
                    "id": "gamepad-" + gpIndex,
                    "data-gamepad-index": gpIndex
                });

            gpContainer.appendChild(gamepad);

            let mapping = gp[i].mapping;
            // Add the buttons for this gamepad
            let j;
            let buttonBox = qs(".gamepad-buttons-box", gamepad)

            for (j = 0; j < gp[i].buttons.length; j++) {
                let buttonContainer = template("#template-gamepad-button-container",
                    {
                        "id": "gamepad-" + gpIndex + "-button-container-" + j
                    });

                    qs(".gamepad-button", buttonContainer).setAttribute("id", "gamepad-" + gpIndex + "-button-" + j);
                    //qs(".gamepad-button-label", buttonContainer).innerHTML = j;

                buttonBox.appendChild(buttonContainer);
            }
            

            // Add the axes for this gamepad
            let axesBox = qs(".gamepad-axes-box", gamepad);
            let axesBoxCount = ((gp[i].axes.length + 1) / 2)|0; // Round up (e.g. 3 axes is 2 boxes)

            for (j = 0; j < axesBoxCount; j++) {
                let axisPairContainer = template("#template-gamepad-axis-pair-container",
                    {
                        "id": "gamepad-" + gpIndex + "-axis-pair-container-" + j
                    });

                //qs(".gamepad-axis-pair", axisPairContainer).setAttribute("id", "gamepad-" + gpIndex + "-axispair-" + j);

                let pairLabel;

                // If we're on the last box and the number of axes is odd, just put one label on there
                if (j == axesBoxCount - 1 && gp[i].axes.length % 2 == 1) {
                    pairLabel = j*2;
                } else {
                    pairLabel = (j*2) + "," + ((j*2)+1);
                }
                //qs(".gamepad-axis-pair-label", axisPairContainer).innerHTML = pairLabel;

                axesBox.appendChild(axisPairContainer);
            }

            // And remember that we have controllers now
            haveControllers = true;

            if (i == currentVisibleController) {
                curControllerVisible = true;
            }

            if (firstController === null) {
                firstController = i;
            }
        }

        // Show or hide the "plug in a controller" prompt as
        // necessary
        if (haveControllers) {
            qs("#prompt").classList.add("nodisp");
            qs("#main").classList.remove("nodisp");
        } else {
            qs("#prompt").classList.remove("nodisp");
            qs("#main").classList.add("nodisp");
        }

        if (curControllerVisible) {
            //showController(currentVisibleController);
        } else {
            currentVisibleController = firstController;
            showController(firstController);
        }
    }

    /**
     * Update the UI components based on gamepad values
     */
     function updateUI() {
        let gamepads = navigator.getGamepads();

        let mode = 'clamp'; // raw, norm, clamp
        let velocitat = 0;
        // For each controller, show all the button and axis information
        for (let i = 0; i < gamepads.length; i++) {
            let gp = gamepads[i];
            let j;

            if (!gp || !gp.connected) { continue; }

            let gpElem = qs("#gamepad-" + i);
            
            // Show button values
            let buttonBox = qs(".gamepad-buttons-box", gpElem);

            for (j = 0; j < gp.buttons.length; j++) {
                let buttonElem = qs("#gamepad-" + i + "-button-" + j, buttonBox)
                let button = gp.buttons[j];
                let vactual= gp.buttons[0].value;
                let vactual1= gp.buttons[1].value;
                let vactual2= gp.buttons[2].value;
                let vactual4= gp.buttons[4].value;
                let vactual3= gp.buttons[5].value;
                let vactual9= gp.buttons[9].value;
                let vamunt= gp.buttons[12].value;
                let vavall= gp.buttons[13].value;
                //let vdreta= gp.buttons[14].value;
                //let vesquerra= gp.buttons[15].value;

                // Put the value in there
                buttonElem.innerHTML = button.value;

                // Change color if pressed or not
                if (vactual==1 && vant==0) {
                    ui_help();
                } else {

                }
                vant=vactual;
                if (vactual1==1 && vant1==0) {
                    stream_screenshot();
                } else {
                    
                }
                vant1=vactual1;
                if (vactual2==1 && vant2==0) {
                    light();
                } else {
        
                }
                vant2=vactual2;
                if (vactual3==1 && vant3==0) {
                    follow();
                } else {
        
                }
                vant3=vactual3;
                if (vactual4==1 && vant4==0) {
                    depth_hold();
                } else {
        
                }
                vant4=vactual4;
                if (vactual9==1 && vant9==0) {
                    stream_video();
                } else {
        
                }
                vant9=vactual9;
                if (vamunt==1 && vantamunt==0) {
                    velocity();
                } else {
                    
                }
                vantamunt= vamunt;
                if (vavall==1 && vantavall==0) {
                    velocity();
                } else {
                    
                }
                vantavall=vavall;
                /*
                if (vesquerra==1 && vantesquerra==0) {
                    left();
                    stop();
                } else {
                    
                }
                vantesquerra=vesquerra;
                if (vdreta==1 && vantdreta==0) {
                    right();
                    stop();
                } else {
                    
                }
                vantdreta=vdreta;
                */
            }


            // Show axis values
            let axesBox = qs(".gamepad-axes-box", gpElem);
            let axesBoxCount = ((gp.axes.length + 1) / 2)|0; // Round up (e.g. 3 axes is 2 boxes)

            for (j = 0; j < axesBoxCount; j++) {
                let axisPairContainer = qs("#gamepad-" + i + "-axis-pair-container-" + j, axesBox);
                let axisPairValue = qs(".gamepad-axis-pair-value", axisPairContainer);
                let axisPip = qs(".gamepad-axis-pip", axisPairContainer);
                let axisCross = qs(".gamepad-axis-crosshair", axisPairContainer);
                let valueX, valueY, valueStr;
                let deadzoneActive = true;

                valueX = gp.axes[j*2];

                // If we're not a single axis in the last box, show the
                // second axis in this box. This handles a last box with
                // a single axis (odd number of axes total).
                let last_odd_axis = j == axesBoxCount - 1 && gp.axes.length % 2 == 1;

                valueY = last_odd_axis? 0: gp.axes[j*2 + 1];
                

                if (deadzoneActive) {
                    [valueX, valueY] = gpLib.deadzone(valueX, valueY);
                }

                // Set the value label
                valueStr = valueX.toFixed(2);

                if (!last_odd_axis)
                    valueStr += ',' + valueY.toFixed(2);

                // Position the raw indicator
                axisCross.style.left = (valueX + 1) / 2 * 100 + '%';
                axisCross.style.top = (valueY + 1) / 2 * 100 + '%';

                // Position the pip, clamping if necessary
                let clampCircle = qs(".gamepad-circle", axisPairContainer);

                if (mode == 'clamp') {
                    // Clamp
                    let clampX, clampY;
                    let altre_joy=false;
                    [clampX, clampY] = gpLib.clamp(valueX, valueY, mode);
                    axisPip.style.left = (clampX + 1) / 2 * 100 + '%';
                    axisPip.style.top = (clampY + 1) / 2 * 100 + '%';

                    if (j==1){
                        joystick_move_controller(valueX,valueY);
                    }
                    
                    if (j==0 && valueY<=-0.90){
                        emerge();
                    }
                    else if (j==0 && valueY>=0.90){
                        immerse();
                    }
                    else if (j==0 && valueX<=-0.90){
                        left();
                    }
                    else if (j==0 && valueX>=0.90){
                        right();
                    }
                    else if (j==0 && valueX==0 && valueY==0){
                        stop_dalt();
                    }


                
                    clampCircle.classList.remove("nodisp");

                    // Overwrite the value string with clamped values
                    valueStr = clampX.toFixed(2)
                    

                    if (!last_odd_axis)
                        valueStr += ',' + clampY.toFixed(2);
                    } else {
                    // Raw
                    axisPip.style.left = axisCross.style.left;
                    axisPip.style.top = axisCross.style.top;

                    clampCircle.classList.add("nodisp");
                }

                // Show coordinates
                axisPairValue.innerHTML = valueStr;
            }
            
        }
     }

    /**
     * Render a frame
     */
    function onFrame() {
        let conCheck = gpLib.testForConnections();

        // Check for connection or disconnection
        if (conCheck) {
            console.log(conCheck + " new connections");

            // And reconstruct the UI if it happened
            rebuildUI();
        }

        // Update all the UI elements
        updateUI();

        requestAnimationFrame(onFrame);
    }

    /**
     * onload handler
     */
    function onLoad() {
        if (gpLib.supportsGamepads()) {
            rebuildUI();
            requestAnimationFrame(onFrame);
        } else {
            qs("#sol").classList.remove("nodisp");
        }
    }

    // Initialization code
    window.addEventListener('load', onLoad);
    
}());
