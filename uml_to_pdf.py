import os
from plantuml import PlantUML

server = PlantUML(url='http://www.plantuml.com/plantuml/img/')
uml_file = 'diagram.puml'
png_file = 'diagram.png'
output_file = 'diagram.pdf'

# Generate PNG first
server.processes_file(uml_file)

# Check if PNG exists before converting
if os.path.exists(png_file):
    os.system(f'magick {png_file} {output_file}')  # Use magick for IMv7
else:
    print(f'PNG file not found: {png_file}')
