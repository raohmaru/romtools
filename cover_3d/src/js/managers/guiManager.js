export async function createGUIManager(context, container, options = {}) {
    const { GUI } = await import('three/addons/libs/lil-gui.module.min.js');
    
    const {
        onToggleRotation = () => {},
        onFOVChange = () => {},
        onReset = () => {},
    } = options;

    const gui = new GUI({
        container,
        width: 170
    });
    gui.title('Advanced options');

    const params = {
        toggleRotation: false,
        fov: options.defaults.fov,
        close() {
            controllers.toggleRotation.reset();
            gui.hide();
        },
        reset() {
            controllers.fov.reset();
            onReset.call(context);
        },
    };

    gui.add(params, 'toggleRotation').name('Show rotation controls');
    gui.add(params, 'fov', 10, 200, 1).name('FOV');
    gui.add(params, 'reset').name('Reset');
    gui.add(params, 'close').name('Close');

    // Create a mapping of property names to controllers
    const controllers = gui.controllers.reduce((acc, curr) => {
        acc[curr.property] = curr;
        return acc;
    }, {});

    gui.onChange(event => {
        switch (event.property) {
            case 'toggleRotation':
                onToggleRotation.call(context, event.value);
                break;

            case 'fov':
                onFOVChange.call(context, event.value);
                break;
        
            default:
                break;
        }
    });

    // Manual update GUI values
    gui.update = (obj) => {
        Object.keys(obj).forEach((param) => {
            if (controllers[param]) {
                params[param] = obj[param];
                controllers[param].updateDisplay();
            }
        });
    }

    return gui;
}