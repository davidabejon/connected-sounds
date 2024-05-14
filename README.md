![image](https://github.com/davidabejon/connected-sounds/assets/71383097/37f597e2-9eda-4d10-962d-02740fc28492)# Connected Sounds
Connected Sounds is a project that aims at connecting different cultures through the thousands of radio broadcasts trasmitted all around the globe.
## API
Powered by [radio.garden](https://radio.garden)'s API and [jonasrmichel](https://github.com/jonasrmichel)'s unofficial [OpenAPI specification](https://jonasrmichel.github.io/radio-garden-openapi/).

Huge thanks to both for making this project come to life.
## Live Demo
Live Demo available at [http://143.47.48.170:4173/](http://143.47.48.170:4173/) hosted on an Oracle Cloud VM.

Due to radio.garden not supporting CORS requests from all origins, the live demo is hosted using [Vite](https://vitejs.dev/)'s preview server. This is meant to be used to check if your project looks good, rather than using it as a production server. Using it is useful in other to take advantage of Vite's built in Proxy, which is extremely easy to set up and use, and let's us bypass any kind of CORS related restrictions.
![Live Demo Screenshot](https://i.imgur.com/UH3S7Oj.jpeg)
## Local Set Up
In order to run the project on the local machine of your choice, first you are going to need Nodejs and NPM installed.

Then, after downloading or cloning the project, open a terminal at the project's root directory and execute the following command in order to install all the dependencies needed for the project to run.
```
npm install
```
After that, you have a handful of options to choose from.

Execute the following command to run a development server.
```
npm run dev
```
Execute the following commands to run a preview server.
```
npm run build
npm run preview
```
Execute the following command to generate a compiled version of the project, which can be hosted on any static web server (such as NginX) as long as a proxy is provided, or the API calls to radio.garden's API will not recieve a response.
```
npm run dev
```
