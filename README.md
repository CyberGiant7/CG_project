# 3D Scene Rendering Application

## Description

This project is developed as part of the Computer Graphics course of the Master's degree in Computer Science at the University of Bologna in the academic year 2023/2024. The project is developed by the student Leonardo Dessì. The goal of the project is to apply the concepts and techniques learned in the course to create a 3D scene rendering application using WebGL. The application is built using HTML, CSS, and JavaScript, with WebGL for rendering 3D graphics. The project includes features such as object creation, transformation, lighting, texturing, and normal mapping, as well as interactive controls for the user to manipulate the scene. The application is designed to be user-friendly and intuitive, with a clean interface that allows for easy navigation and interaction.

## Project Structure

The project is organized into several JavaScript files, each responsible for different aspects of the 3D scene rendering process. The project structure is as follows:

- **docs** - Contains documentation or additional resources for the project, such as an HTML file that serves as a landing page or documentation entry point.
- **project** - Contains the main project files, including the HTML, CSS, and JavaScript files.
  - **data** - Contains the OBJ and MTL files for the 3D models used in the scene.
  - **resources** - Contains the main JavaScript files for the project.
    - **libraries** - Contains various JavaScript libraries used in the project, such as jQuery, WebGL utilities, a matrix manipulation library (m4.js), and dat.gui for creating graphical user interfaces.
    - **shaders** - Contains the vertex and fragment shaders used for rendering the 3D scene.
    - **style** - Contains CSS stylesheets for the project, including styles for dat.gui and the main style.css.

The main components are:

- `main.js`: This is the entry point of the application. It initializes the scene and objects, and starts the rendering loop.
- `Scene.js`: This file defines the Scene class, which handles the setup and management of the WebGL context, shaders, and scene controls.
- `SceneObject.js`: This file defines the SceneObject class, representing individual objects within the scene. It handles loading the object's mesh and materials and rendering the object.
- `InputHandler.js`: This file manages user inputs, including mouse, keyboard and touch interactions, to control the scene's camera and object properties.
- `mathUtils.js`: A utility file that provides mathematical functions used in the project, such as conversions between degrees and radians, and vector operations.
- `meshLoader.js`: A utility file that loads 3D models in OBJ format and converts them into a format that can be used by the application.
- `parsers.js`: A utility file that contains parser of .obj and .mtl files.
- `textureUtils.js`: A utility file that loads image textures and normal maps for objects in the scene.

## Setup and Run Instructions

To run the project, follow these steps:

1. Clone the repository to your local machine using the following command:
   ```
   git clone https://github.com/CyberGiant7/ComputerGraphicsProject.git
   ```

2. Navigate to the project directory:
   ```
   cd ComputerGraphicsProject
   ```

3. Open the `index.html` file located in the `project` directory in your web browser to view the 3D scene rendering application.

## Features

The project includes the following features:

- **Object Creation**: The application allows for the creation of 3D objects within the scene.
- **Transformation**: Objects can be transformed (translated, rotated, and scaled) within the scene.
- **Lighting**: The application includes lighting effects, such as ambient, diffuse, and specular lighting.
- **Texturing**: Objects can be textured using image files.
- **Normal Mapping**: The application supports normal mapping to add detailed surface textures to objects.

## Interactive Controls

The project includes interactive controls for the user to manipulate the scene. The controls are as follows:

- **Scene Controls**: Allows the user to adjust the position of the scene or camera (x, y, z coordinates), the field of view (fov), and the camera's orientation (phi and theta angles), as well as the distance of the camera from the scene.
- **Light Controls**: Provides controls for adjusting the intensity and color of the light in the scene. It also includes sub-folders for more specific types of light, such as:
  - **Spotlight Controls**: Allows for the manipulation of the spotlight's position (x, y, z coordinates).
  - **Directional Light Controls**: Offers toggles and controls for a directional light's usage and direction (x, y, z components).
- **Advanced Rendering**: Contains toggles for using normal maps and specular maps, which are techniques used to enhance the visual quality of the rendered scene.

## Shaders

The project uses two shaders: a vertex shader and a fragment shader. The shaders are written in GLSL (OpenGL Shading Language) and are responsible for processing vertices and fragments, respectively, during the rendering process.

### Vertex Shader

The vertex shader (`vertex_shader.glsl`) operates on individual vertices of a 3D model. It receives several attributes for each vertex, including its position (`a_position`), normal vector (`a_normal`), tangent vector (`a_tangent`), texture coordinates (`a_texcoord`), and color (`a_color`). Additionally, it uses uniform variables that are constant for all vertices being processed in a single draw call, such as the transformation matrices (`u_projection`, `u_view`, `u_world`), the world positions of the light source (`u_lightWorldPosition`), and the camera/view (`u_viewWorldPosition`).

The main tasks of the vertex shader include:

1. **Transforming vertex positions**: It calculates the vertex's position in world space by multiplying the model's world matrix (`u_world`) with the vertex's position. Then, it computes the vertex's position in clip space (the final position on the screen) by further multiplying with the view and projection matrices (`u_view` and `u_projection`).
2. **Normal and tangent transformation**: It transforms the vertex's normal and tangent vectors to align with the world space orientation of the model. This is crucial for correct lighting calculations in the fragment shader.
3. **Passing through attributes**: It passes through the texture coordinates and color directly to the fragment shader without modification.
4. **Calculating light and view vectors**: It computes vectors from the surface to the light source and from the surface to the camera. These vectors are used in the fragment shader for lighting calculations.

### Fragment Shader

The fragment shader (`fragment_shader.glsl`) operates on fragments (potential pixels) and determines their final color. It receives varying variables interpolated from the vertex shader, including the transformed normal (`v_normal`), tangent (`v_tangent`), texture coordinates (`v_texcoord`), color (`v_color`), and the vectors to the light source and view (`v_surfaceToLight` and `v_surfaceToView`). It also uses several uniform variables to define material properties and lighting conditions.

The main tasks of the fragment shader include:

1. **Normal mapping**: If enabled (`u_useNormalMap`), it modifies the surface normal based on a normal map texture. This allows for detailed surface lighting effects without increasing the geometric complexity of the model.
2. **Lighting calculations**: It calculates the diffuse and specular lighting based on the surface's orientation to the light source and view. This can be done using either a directional light model or by directly using the light and view vectors calculated in the vertex shader.
3. **Texturing and color**: It applies a diffuse texture map and optionally a specular map to determine the surface's diffuse and specular colors. It also factors in the vertex color for additional color effects.
4. **Opacity and discard**: It calculates the effective opacity of the fragment and discards it if below a certain threshold, allowing for transparency effects.
5. **Final color calculation**: It combines the emissive, ambient, diffuse, and specular contributions to compute the final color of the fragment, factoring in the light color and material shininess.

## 3D Models

The models used in this project are 3: the room, the custom painting with my face and the light bulb. The 3D model of the room was taken from Sketchfab, at the following link: [Link to the 3D model of the room](https://sketchfab.com/3d-models/the-bathroom-free-d5e5035dda434b8d9beaa7271f1c85fc)

The 3D model of the light bulb was taken from Sketchfab, at the following link: [Link to the 3D model of the light bulb](https://sketchfab.com/3d-models/low-poly-light-bulb-a7d27c2224d94c86a04083de8f9df7db)

The 3D model of the custom painting with my face was taken from the room model. The painting is a copy of the paintings already in the room, but the texture was changed through blender to include my face.

All models were downloaded in FBX format and converted to OBJ format via **Blender**. When importing the model into Blender, the materials were loaded incorrectly, so the materials had to be changed and textures reapplied.

## References

The following resources were used in the development of this project:

- [WebGL Fundamentals](https://webglfundamentals.org/): A comprehensive guide to WebGL programming concepts and techniques, including shaders, buffers, textures, and more.
- [Learn WebGL](https://learnwebgl.brown37.net/index.html): A series of tutorials and examples for learning WebGL programming from the basics to advanced topics.
- [MDN Web Docs - WebGL Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial): A tutorial series on WebGL programming from Mozilla Developer Network.
- [WebGL Reference Card](https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf): A quick reference guide to WebGL functions, constants, and syntax.
