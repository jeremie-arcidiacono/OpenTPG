# Usage :
# 1. Get the CSV file from https://ge.ch/sitg/fiche/1350
# 2. Keep the default name "TPG_ARRETS.csv"
# 3. Run the script
# 4. The JSON file will be created in the same folder as the script (output_arrets.json)


# 1. We have a CSV file with the following format:
# ID; NOM; LIGNES; DIRECTIONS_LIGNES; E; N

# 2. We want to convert it to a JSON file with the following format:
# { [ "NOM": "LIGNES", "NOM2": "LIGNES2" ] }

# 3. We want to write the JSON file in a file called "output.json"

# The NOM is duplicated in the CSV file, so we want to group the LIGNES by NOM

import csv
import json
import urllib.request
import time

# calcule time between start and end of script
start_time = time.time()

print("Reading CSV file...")
# Open the CSV file encoded in UTF-8-BOM
with open('TPG_ARRETS.csv', 'r', encoding='utf-8-sig') as csvFile:
    reader = csv.reader(csvFile, delimiter=';')
    next(reader, None) # Skip the header

    dictStations = {}
    for row in reader:
        if row:
            name = row[1]
            lines = row[2]
            
            if name in dictStations:
                dictStations[name] = dictStations[name] + "," + lines
            else:
                dictStations[name] = lines

csvFile.close()
print("Reading CSV file done")



print("Processing data...")
# In the dictionary, the LIGNES are separated by a comma
# We want to replace that with a list of non-duplicated LIGNES
for key in dictStations:
    lines = dictStations[key].split(",")
    
    lines = list(dictStations.fromkeys(lines)) # Remove the duplicates
    lines.sort()
    
    dictStations[key] = lines
print("Processing data done")



print("Fetching IDs of stations...")
dictStationsFormatted = {}
nbStations = len(dictStations)
i = 0
for key in dictStations:
    i = i + 1
    if i % 50 == 0:
        print("Processing station " + str(i) + " / " + str(nbStations) + " (%.2f%%)" % (i / nbStations * 100))

    
    url = "https://transport.opendata.ch/v1/locations?query=" + key + "&type=station"

    # Encode the URL to remove non-ASCII characters
    url = urllib.parse.quote(url, safe=':/?=&')

    # Fetch the data from the API
    with urllib.request.urlopen(url) as url:
        data = json.loads(url.read().decode())
        
        # If the API returns a result, we use it
        id = None
        if data:
            # Check if the name of the station is the same as the one in the CSV file
            for station in data['stations']:
                if station['name'] == key and station['id'] is not None:
                    id = station['id']
                    break
            # If not, we use the first station that has an ID (it's not perfect, but it's better than nothing)
            if id is None:
                for station in data['stations']:
                    if station['id'] is not None:
                        id = station['id']
                        break
    
    if id is not None:
        dictStationsFormatted[id] = { "name": key, "lines": dictStations[key] }
    else:
        print("No ID found for " + key)
print("Fetching IDs of stations done")

print("Writing JSON file...")
# Open the JSON file
with open('stations.json', 'w', encoding='utf-8') as jsonFile:
    dictFinal = { 
        "version": "1.0",
        "date": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "stations": dictStationsFormatted 
        }
    json.dump(dictFinal, jsonFile, indent=None, ensure_ascii=False)

jsonFile.close()
print("Writing JSON file done")

print("Done in %.2f seconds" % (time.time() - start_time))
