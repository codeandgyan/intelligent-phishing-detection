# Intelligent Phishing Detection

This is a feature collector automation script for collecting prominent features from different websites.
These set of features will be fed to Machine Learning for creating a model.

## Getting Started

 - Clone this repo.
    ```
    git clone https://github.com/codeandgyan/intelligent-phishing-detection.git
    ```
 - Change directory to `phish-feature-collector-service`
   ```
   cd phish-feature-collector-service
   ```
 - Open the folder `phish-feature-collector-service` on VS Code.
 - Install the dependencies.
    ```
    npm install
    ```
    
 ## Running the Services
 
 The project contains an API service with two end points.
 
   ### Site Data Collector Service (A standalone service which will collect the data from good / bad sites


   ### Site Data API service
   (An express service which will return the site data for the requested URL.)
   - Run the API service (on a new terminal) - The service should run on port 8000.
      ```
      node server.js
      ```
   
   ### Testing the endpoint
   - Endpoint 1
     - You can test this API by making a **GET** call to the endpoint `http://localhost:8000/sitedata` by passing `sourceurl` and `company` as given the example (irctc)
     - The response returned by this API would include the url of screenshot of the website - look for the field `pageScreenshot`.
   - Endpoint 2
     - You can use the endpoint **POST** `http://localhost:8000/start-scan` by passing the `type: good or phish` to start the scan.
     - The scan would take a little longer time to finish. No response might be returned until that time.
     - scan type `phish` might not work correctly on Gen network.
     - The scanned site screenshots will be created in `./public/screenshots/` folder.
     - Once the scan is complete, the feature output will be created in `./public/output/output.json` file

  
