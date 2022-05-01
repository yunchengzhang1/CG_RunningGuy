import bpy
import os

# BEFORE EXPORT: CTRL+A and normalize all ROTATION+SCALE 

# print output in all open console 
def print(data):
    for window in bpy.context.window_manager.windows:
        screen = window.screen
        for area in screen.areas:
            if area.type == 'CONSOLE':
                override = {'window': window, 'screen': screen, 'area': area}
                bpy.ops.console.scrollback_append(override, text=str(data), type="OUTPUT")
               
               
#
 
# get current directory
cwd = os.getcwd()

print(cwd)

output_dir = 'C:\\Users\\AZ\\Desktop\\22spring\\CG\Project2\\hat.txt' 
# 482 vertices, 960 indices

#output_dir = 'C:\\Users\\AZ\\Desktop\\22spring\\CG\Project2\\upperL.txt'
# 288 vertices, 572 indices

#output_dir = 'C:\\Users\\AZ\\Desktop\\22spring\\CG\Project2\\upperR.txt'
# 288 vertices, 572 indices

#output_dir = 'C:\\Users\\AZ\\Desktop\\22spring\\CG\Project2\\lowerL.txt'
# 288 vertices, 572 indices

#output_dir = 'C:\\Users\\AZ\\Desktop\\22spring\\CG\Project2\\footL.txt'
# 121 vertices, 238 indices

#output_dir = 'C:\\Users\\AZ\\Desktop\\22spring\\CG\Project2\\footR.txt'
# 121 vertices, 238 indices

#output_dir = 'C:\\Users\\AZ\\Desktop\\22spring\\CG\robot_guy\\robot_head.txt'

polygons = []
me = bpy.context.object.data
# export the recently selected object
# x, y, z, R, G, B, A
vertices = [(round(vert.co.x, 3), round(vert.co.y, 3), round(vert.co.z, 3), 1, 1, 1, 1) for vert in bpy.context.object.data.vertices]

vertices1=[]
vertice_counter = len(me.vertices)

for vertex in vertices:
    for n in vertex:
        vertices1.append(n)

print(vertices)
print(vertice_counter) 
 
faces = [[vert for vert in polygon.vertices] for polygon in bpy.context.object.data.polygons]
 
indices=[]
triangle_counter= len(me.polygons)
for face in faces:
    for n in face:
        indices.append(n)
print(triangle_counter)     
        
with open(output_dir, 'w') as file:
#    file.write('verts = ' + str(vertices) + '\n' + 'faces = ' + str(faces) + '\n')

#print out vertices and indices for webgl
    file.write('var vertices = ' + str(vertices1) + '\n' + 'var indices = ' + str(indices) + '\n')
    
    file.close()
