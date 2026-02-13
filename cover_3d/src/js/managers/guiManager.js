export async function createGUIManager(context, container, options = {}) {
    const { GUI } = await import('three/addons/libs/lil-gui.module.min.js');
    
    const {
        onToggleTransformation = () => {},
        onFOVChange = () => {},
        onReset = () => {},
    } = options;

    const gui = new GUI({
        container,
        width: 170
    });
    gui.title('Advanced options');

    const reset = () => {
        controllers.toggleRotation.reset();
        controllers.toggleScale.reset();
    };

    const params = {
        toggleRotation: false,
        toggleScale: false,
        fov: options.defaults.fov,
        close() {
            reset();
            gui.hide();
        },
        reset() {
            controllers.fov.reset();
            onReset.call(context);
        },
    };

    gui.add(params, 'toggleRotation').name('Show rotation controls');
    gui.add(params, 'toggleScale').name('Show scaling controls');
    gui.add(params, 'fov', 10, 200, 1).name('FOV');
    gui.add(params, 'reset').name('Reset');
    gui.add(params, 'close').name('Close');

    // Create a mapping of property names to controllers
    const controllers = gui.controllers.reduce((acc, curr) => {
        acc[curr.property] = curr;
        return acc;
    }, {});

    gui.onChange(event => {
        const { value } = event;
        switch (event.property) {
            case 'toggleRotation':
                controllers.toggleScale.disable(value);
                onToggleTransformation.call(context, 'rotate', value);
                break;
            
            case 'toggleScale':
                controllers.toggleRotation.disable(value);
                onToggleTransformation.call(context, 'scale', value);
                break;

            case 'fov':
                onFOVChange.call(context, value);
                break;
        
            default:
                break;
        }
    });

    const _gui_show = gui.show;
    gui.show = (show) => {
        _gui_show.call(gui, show);
        if (!show) {
            reset();
        }
    };

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