# Game Box 3D

A web-based 3D application that lets you create and view video game box covers in interactive 3D. Upload custom images for each face of a cube, rotate around it, save your configurations, and capture screenshots.

## Getting Started

### Prerequisites

- A modern web browser with WebGL support (Chrome, Firefox, Edge, Safari)
- Node.js (v22 or later)
- npm or yarn package manager

### Installation

1. Clone or download the project files to your local machine:
   ```bash
   git clone https://github.com/raohmaru/cover_3d.git
   cd cover_3d
   ```

2. Open `src/index.html` in your web browser

   > **Note**: For the best experience, use a local development server to avoid CORS issues with file protocols:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (with npx)
   npx serve .
   ```
   
   Then navigate to `http://localhost:8000`

### Usage Guide

#### Uploading Images

1. Click the file input for any face (Front, Back, Spine, etc.)
2. Select an image file (PNG, JPG, GIF, WebP)
3. The image will automatically apply to the corresponding cube face

> **Tip**: You can also drag and drop images directly onto the 3D canvas!

#### Camera Controls

| Action | Control |
|--------|---------|
| Rotate | Click and drag |
| Zoom | Scroll wheel |
| Reset View | Press `R` or click "Reset Camera" |

#### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `R` | Reset camera |
| `S` | Save configuration |
| `L` | Load configuration |
| `P` | Take screenshot |
| `?` | Show all shortcuts |

#### Saving Configurations

1. Click **Save Configuration** to download a JSON file containing all your images and settings
2. Use **Load Configuration** to restore a previously saved setup
3. Select from **Game Box Presets** to switch between different box sizes
4. Choose **View Presets** to quickly position the camera

#### Taking Screenshots

1. Click **Take Screenshot** to capture the current view
2. Use the dropdown to select image quality (x1 to x4 resolution multiplier)
3. Screenshots are saved as transparent PNG files with timestamps

---

## Browser Support

| Browser | Support Level |
|---------|---------------|
| Chrome 113+ | ✅ Full WebGL support |
| Edge 113+ | ✅ Full WebGL support |
| Firefox | ✅ WebGL supported |
| Safari 17+ | ✅ WebGL supported |

## Tech Stack

- **Language**: Plain JavaScript (ES6+ modules)
- **3D Engine**: Three.js (WebGL)
- **Styling**: Pure CSS3
- **Build Tool**: None required (native ES modules)

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## Acknowledgments

- [Three.js](https://threejs.org/) for the amazing 3D library
- All contributors and testers
