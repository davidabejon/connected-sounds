# Connected Sounds
Connected Sounds is a project that aims at building bridges between different cultures through the thousands of radio broadcasts being trasmitted all around the globe.
## API
Powered by [radio.garden](https://radio.garden)'s API and [jonasrmichel](https://github.com/jonasrmichel)'s unofficial [OpenAPI specification](https://jonasrmichel.github.io/radio-garden-openapi/).

Huge thanks to both for making this project come to life.
## Live Demo
Live Demo available at [https://radio.davidabejon.cv/](https://radio.davidabejon.cv/). Feel free to tune in any time you want!

Each green dot showed on the map is a radio station. Click on one of them and start listening to the broadcast.

![Live Demo Screenshot](https://i.imgur.com/56YEHwc.jpeg)
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
npm run build
```
