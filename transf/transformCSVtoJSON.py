# Author : Grégoire Péan and Jérémie Arcidiacono
# Date : January - March 2023
# Description : This script converts the CSV files from the TPG website to JSON files that can be used by the app

# Usage :
# 1. Get the CSV file from https://ge.ch/sitg/fiche/1350
# 2. Get the CSV file from https://ge.ch/sitg/fiche/8423
# 2. Keep the default name "TPG_ARRETS.csv" and "TPG_LIGNES.csv"
# 3. Run the script
# 4. The 2 JSON files will be created in the same folder as the script (stations.json and lines.json)



# Processing of the stations :
# 1. We have a CSV file with the following format:
# ID; NOM; LIGNES; DIRECTIONS_LIGNES; E; N

# 2. We want to convert it to a JSON file with the following format:
# { [ "NOM": "LIGNES", "NOM2": "LIGNES2" ] }

# 3. We want to write the JSON file in a file called "stations.json"

# The NOM is duplicated in the CSV file, so we want to group the LIGNES by NOM



# Processing of the lines :
# For each individual line, we want to get the color (background and text) from the API.

# 1. We have a CSV file with the following format:
# OBJECTID;LIGNE;NOM_LIGNE;DIRECTION;VEHICULE;TYPE_SERVICE;SHAPE.LEN

# 2. We want to convert it to a JSON file with the following format:
# { [ "LIGNE": "ffe900~000000", "LIGNE2": "dd0017~ffffff" ] }

# 3. We want to write the JSON file in a file called "lines.json"

# The LIGNE is duplicated in the CSV file, so we want to group the colors by LIGNE


import csv
import json
import urllib.request
import time

### CONSTANTS ###
COLOR_ADJUSTMENT_FACTOR = 0.2 # A value between 0 and 1. The higher the value, the lighter the color will be
DEFAULT_COLOR = "000000~ffffff" # The default color to use if the API doesn't return a color for a line
CURRENT_VERSION = "1.0" # The current version of the script


# calcule time between start and end of script
totalExecutionTime = time.time()
stationsProcessExecutionTime = time.time()

print ("** Start the processing of the stations **")

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

            # If the station is already in the dictionary, we add the new lines to the existing ones
            # Otherwise, we create a new entry in the dictionary
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

    # Left trim 0 from the lines
    for i in range(len(lines)):
        lines[i] = lines[i].lstrip('0')

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
        "version": CURRENT_VERSION,
        "date": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "stations": dictStationsFormatted
        }
    json.dump(dictFinal, jsonFile, indent=None, ensure_ascii=False)

jsonFile.close()
print("Writing JSON file done")

print("Processing stations done in %.2f seconds" % (time.time() - stationsProcessExecutionTime))
print()





# Methods generated by ChatGPT to manage the colors : convertion and adjustment (make the color lighter)
def adjustColor(color):
    hsv = rgbToHsv(color)

    # Reduce the saturation
    hsv[1] = max(0, hsv[1] - COLOR_ADJUSTMENT_FACTOR)

    # Convert the color back to RGB
    rgb = hsvToRgb(hsv)

    return rgb

def hexToRgb(hex):

    # Extract the red, green, and blue values
    r = int(hex[0:2], 16)
    g = int(hex[2:4], 16)
    b = int(hex[4:6], 16)

    return [r, g, b]
    
def rgbToHsv(rgb):
    r = rgb[0] / 255.0
    g = rgb[1] / 255.0
    b = rgb[2] / 255.0

    max_value = max(r, g, b)
    min_value = min(r, g, b)
    delta = max_value - min_value

    if delta == 0:
        h = 0
    elif max_value == r:
        h = ((g - b) / delta) % 6
    elif max_value == g:
        h = ((b - r) / delta) + 2
    else:
        h = ((r - g) / delta) + 4

    h *= 60
    s = 0 if max_value == 0 else delta / max_value
    v = max_value

    return [h, s, v]
    
def rgbToHex(rgb):
    # Convert the red, green, and blue values to hexadecimal strings
    hex_r = format(rgb[0], '02x')
    hex_g = format(rgb[1], '02x')
    hex_b = format(rgb[2], '02x')

    return hex_r + hex_g + hex_b

def hsvToRgb(hsv):
    h = hsv[0] / 60.0
    s = hsv[1]
    v = hsv[2]

    i = int(h)
    f = h - i

    p = v * (1 - s)
    q = v * (1 - (s * f))
    t = v * (1 - (s * (1 - f)))

    if i == 0:
        r, g, b = v, t, p
    elif i == 1:
        r, g, b = q, v, p
    elif i == 2:
        r, g, b = p, v, t
    elif i == 3:
        r, g, b = p, q, v
    elif i == 4:
        r, g, b = t, p, v
    else:
        r, g, b = v, p, q

    return [int(r * 255), int(g * 255), int(b * 255)]



linesProcessExecutionTime = time.time()
print ("** Start the processing of the lines **")

print("Reading CSV file...")
# Open the CSV file encoded in UTF-8-BOM
with open('TPG_LIGNES.csv', 'r', encoding='utf-8-sig') as csvFile:
    reader = csv.reader(csvFile, delimiter=';')
    next(reader, None) # Skip the header

    dictLinesTerminal = {} # E.g. "12": "Thônex, Moillesulaz"
    for row in reader:
        if row:
            line = row[1]
            terminalStation = row[3]

            # Left trim 0 from the line (e.g. "02" -> "2")
            line = line.lstrip('0')

            if '/' in terminalStation:
                terminalStation = terminalStation.split('/')[0]

            if line not in dictLinesTerminal:
                dictLinesTerminal[line] = terminalStation
csvFile.close()
print("Reading CSV file done")

print("Fetching colors of lines...")
dictLinesColors = {}
nbLines = len(dictLinesTerminal)
i = 0
for line in dictLinesTerminal:
    i = i + 1
    if i % 20 == 0:
        print("Processing line " + str(i) + " / " + str(nbLines) + " (%.2f%%)" % (i / nbLines * 100))

    url = "https://timetable.search.ch/api/stationboard.en.json?stop=" + dictLinesTerminal[line]

    # Encode the URL to remove non-ASCII characters
    url = urllib.parse.quote(url, safe=':/?=&')

    # Fetch the data from the API
    with urllib.request.urlopen(url) as url:
        data = json.loads(url.read().decode())

        # If the API returns a result, we use it
        if data and 'connections' in data and data['connections']:
            for connection in data['connections']:
                if connection['line'] == line:
                    if len(connection['color']) > 2:
                        backgroundColor = connection['color'].split("~")[0]
                        textColor = connection['color'].split("~")[1]

                        if len(backgroundColor) == 3 :
                            backgroundColor = backgroundColor[0] + backgroundColor[0] + backgroundColor[1] + backgroundColor[1] + backgroundColor[2] + backgroundColor[2]

                            backgroundColor = hexToRgb(backgroundColor)
                            backgroundColor = adjustColor(backgroundColor)
                            backgroundColor = rgbToHex(backgroundColor)

                        if len(textColor) == 3 :
                            textColor = textColor[0] + textColor[0] + textColor[1] + textColor[1] + textColor[2] + textColor[2]

                        dictLinesColors[line] = backgroundColor + "~" + textColor
                    else:
                        # API doesn't return the colors of the lines
                        print("[01] No color found for line " + line + " (terminal : " + dictLinesTerminal[line] + ")")
                        dictLinesColors[line] = DEFAULT_COLOR
                    break
            if line not in dictLinesColors:
                # API doesn't return this line for this terminal at this time
                print("[02] No color found for line " + line + " (terminal : " + dictLinesTerminal[line] + ")")
                dictLinesColors[line] = DEFAULT_COLOR
        else:
            # API doesn't return any result (probably because the terminal is not recognized)
            print("[03] No color found for line " + line + " (terminal : " + dictLinesTerminal[line] + ")")
            dictLinesColors[line] = DEFAULT_COLOR
print("Fetching colors of lines done")

print("Writing JSON file...")
# Open the JSON file
with open('lines.json', 'w', encoding='utf-8') as jsonFile:
    dictFinal = {
        "version": CURRENT_VERSION,
        "date": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "lines": dictLinesColors
        }
    json.dump(dictFinal, jsonFile, indent=None, ensure_ascii=False)

jsonFile.close()
print("Writing JSON file done")

print("Processing lines done in %.2f seconds" % (time.time() - linesProcessExecutionTime))
print()

print("Script done in %.2f seconds" % (time.time() - totalExecutionTime))
