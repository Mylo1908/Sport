"""Original CC0 Sport drawings. Standard library only; dimensions are schematic cm.

Manufacturer references document machine topology, not copied artwork or models.
See docs/SPORT_ILLUSTRATION_AUDIT.md. Run from the repository root.
"""
from pathlib import Path
from math import cos, sin, pi
from html import escape

GREEN = '#b5ef39'
GRAY = '#46545d'


class Drawing:
    def __init__(self):
        self.parts, self.points = [], []

    def project(self, p):
        x, y, z = p
        q = (.86*x-.58*y, .26*x+.36*y-z)
        self.points.append(q)
        return q

    def points_text(self, points):
        return ' '.join(f'{x:.2f},{y:.2f}' for x, y in map(self.project, points))

    def polygon(self, points, fill='#101b22', stroke=GREEN, width=1.25):
        self.parts.append(f'<polygon points="{self.points_text(points)}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>')

    def line(self, points, color=GREEN, width=1.2):
        self.parts.append(f'<polyline points="{self.points_text(points)}" fill="none" stroke="{color}" stroke-width="{width}"/>')

    def beam(self, a, b, accent=False, width=5):
        # Steel section with a narrow highlighted edge, not a glowing solid bar.
        self.line([a, b], '#17232d', width+2)
        self.line([a, b], GRAY, width)
        self.line([a, b], GREEN if accent else '#67777c', .85)

    def box(self, x, y, z, dx, dy, dz, accent=False):
        a=(x,y,z); b=(x+dx,y,z); c=(x+dx,y+dy,z); d=(x,y+dy,z)
        e=(x,y,z+dz); f=(x+dx,y,z+dz); g=(x+dx,y+dy,z+dz); h=(x,y+dy,z+dz)
        stroke=GREEN if accent else GRAY
        self.polygon([b,c,g,f], '#0e1720', stroke, 1)
        self.polygon([c,d,h,g], '#111f26', stroke, 1)
        self.polygon([e,f,g,h], '#1a2a2c', stroke, 1.15)

    def pad(self, corners, offset=(0,0,-4)):
        lower=[tuple(p[i]+offset[i] for i in range(3)) for p in corners]
        for i in range(len(corners)):
            self.polygon([corners[i-1],lower[i-1],lower[i],corners[i]], '#0b151c', GRAY, .9)
        self.polygon(corners, '#16261f', GREEN, 1.55)
        # Inset stitching remains subordinate to the outer silhouette.
        center=[sum(p[i] for p in corners)/len(corners) for i in range(3)]
        inset=[tuple(p[i]*.9+center[i]*.1 for i in range(3)) for p in corners]
        self.polygon(inset, 'none', '#506b40', .65)

    def disc(self, p, radius, normal='y', color=GREEN, width=1.2, fill='#0e1920'):
        x,y=self.project(p)
        m={'y':'.86 .26 0 -1','x':'-.58 .36 0 -1','z':'.86 .26 -.58 .36'}[normal]
        # Include the projected circumference in the automatic framing.
        for i in range(16):
            a=2*pi*i/16; r=radius*cos(a); t=radius*sin(a)
            self.project((p[0]+(r if normal!='x' else 0),p[1]+(r if normal=='x' else t if normal=='z' else 0),p[2]+(t if normal!='z' else 0)))
        self.parts.append(f'<circle r="{radius}" transform="matrix({m} {x:.2f} {y:.2f})" fill="{fill}" stroke="{color}" stroke-width="{width}"/>')

    def pulley(self, p, r=6):
        self.disc(p,r,color=GRAY,width=1.5)
        self.disc(p,r*.68,color=GREEN,width=.85,fill='none')
        self.disc(p,1.7,color='#93ad71',width=.7)

    def plates(self, x, y, z, side, radius=22, count=2):
        for i in range(count):
            yy=y+side*i*4
            self.disc((x,yy,z),radius,fill='#10201c')
            self.disc((x,yy,z),radius-2.5,color='#698844',width=.7,fill='none')
            self.disc((x,yy,z),3.2,color=GREEN,width=.8)
        self.beam((x,y,z),(x,y+side*(count*4+8),z),True,3)
        self.disc((x,y+side*(count*4+2),z),4,color=GRAY)

    def roller(self, x, y, z, length=48, radius=8):
        a=(x,y-length/2,z); b=(x,y+length/2,z)
        self.beam((x,a[1]-4,z),(x,b[1]+4,z),False,2)
        self.disc(b,radius,color=GRAY)
        v=(radius*.621,0,-radius*.784)
        shifted=lambda p,f:tuple(p[i]+v[i]*f for i in range(3))
        self.polygon([shifted(a,1),shifted(b,1),shifted(b,-1),shifted(a,-1)],'#14221f',GRAY)
        self.line([shifted(a,-1),shifted(b,-1)],GREEN,.85)
        self.disc(a,radius)

    def base(self, x1, x2, width):
        for y in [width/2,-width/2]:
            self.beam((x1,y,4),(x2,y,4),True)
            for x in [x1,x2]:
                self.box(x-7,y-7,0,14,14,4)
                self.disc((x,y,4.5),1.3,normal='z',color='#788877',width=.6)
        self.beam((x1,width/2,4),(x1,-width/2,4))
        self.beam((x2,width/2,4),(x2,-width/2,4))

    def stack(self,x,y,height=165):
        # Open guard, guide rods, individually separated plates and selector pin.
        self.box(x-15,y-21,7,30,42,4)
        for yy in [y-22,y+22]:
            self.beam((x-12,yy,8),(x-12,yy,height),False,4)
        self.beam((x-12,y-22,height),(x-12,y+22,height),True,4)
        for yy in [y-12,y+12]:
            self.beam((x+2,yy,12),(x+2,yy,height-10),False,1.7)
        for z in range(14,96,7):self.box(x-8,y-17,z,19,34,5)
        self.line([(x+12,y-17,59),(x+18,y-17,59)],GREEN,2.5)
        self.box(x-9,y-18,99,20,36,7,True)

    def finish(self, name, description):
        xs=[p[0] for p in self.points];ys=[p[1] for p in self.points]
        scale=min(400/(max(xs)-min(xs)),292/(max(ys)-min(ys)))
        tx=230-scale*(max(xs)+min(xs))/2;ty=170-scale*(max(ys)+min(ys))/2
        content=''.join(self.parts)
        svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 360" width="460" height="360" role="img" aria-labelledby="title desc"><title id="title">{escape(name)}</title><desc id="desc">{escape(description)}</desc><rect width="460" height="360" fill="#090d17"/><ellipse cx="230" cy="327" rx="180" ry="12" fill="#0e1720"/><g transform="translate({tx:.2f} {ty:.2f}) scale({scale:.4f})" stroke-linejoin="round" stroke-linecap="round">{content}</g></svg>'
        return svg


def bench(d):
    d.beam((-73,0,8),(58,0,8),True,6)
    for x in [-65,48]:
        d.beam((x,-31,5),(x,31,5),False,6)
        d.beam((x,0,8),(0 if x<0 else 20,0,47),False,5)
    d.beam((-55,0,13),(-42,0,71),True,4)
    for z in range(20,61,8):d.line([(-55,-4,z),(-55,4,z)],GRAY,1)
    d.beam((-75,0,101),(-8,0,50),False,4)
    d.pad([(-10,-20,51),(31,-20,51),(31,20,51),(-10,20,51)])
    d.pad([(-10,-20,54),(-72,-20,106),(-72,20,106),(-10,20,54)],(3,0,-3))
    d.pulley((-10,-23,49),3)
    d.disc((-70,0,7),6,normal='y',color=GRAY)


drawings={}
d=Drawing();d.base(-88,72,144)
for y in [72,-72]:
    for x in [-40,34]:d.beam((x,y,4),(x,y,207),False,5)
    d.beam((-40,y,207),(34,y,207),True,5)
    d.beam((-28,y,17),(-28,y,199),True,2.5)
    for z in range(35,190,14):d.line([(-40,y,z),(-34,y,z),(-34,y,z+4)],GRAY,.9)
    d.box(-32,y-5,123,8,10,19,True)
    d.beam((-29,y,67),(-12,y,67),True,3)
d.beam((-40,72,207),(-40,-72,207),True,5)
d.beam((34,72,207),(34,-72,207),False,5)
bench(d)
d.beam((-28,-101,133),(-28,101,133),True,2.6)
for side in [1,-1]:d.plates(-28,side*79,133,side,19)
drawings['smith-incline']=d.finish('Smith-Maschine mit Schrägbank','Geführte Hantel mit zwei Schlitten, Fanghaken und Sicherheitsanschlägen. Verstellbare Schrägbank mittig unter der Stange.')

d=Drawing();d.base(-65,72,95);d.stack(-48,8,181)
d.beam((-45,0,4),(-14,0,171),False,5)
d.beam((-14,-47,171),(-14,47,171),True,5)
for y in [47,-47]:
    d.disc((-14,y,171),9,normal='z',color=GRAY)
    d.beam((-14,y,171),(40,y*1.35,158),True,4)
    d.beam((40,y*1.35,158),(54,y*1.35,114),True,4)
    d.beam((54,y*1.35,114),(54,y*1.1,114),False,3)
    d.beam((54,y*1.1,106),(54,y*1.1,128),True,3)
    d.line([(-14,y,169),(-42,y*.7,173),(-48,8,173),(-48,8,106)],'#738d54',.9)
d.beam((10,0,5),(10,0,53),False,6)
d.pad([(-7,-22,56),(34,-22,56),(34,22,56),(-7,22,56)])
d.pad([(-12,-21,63),(-24,-21,140),(-24,21,140),(-12,21,63)],(-4,0,0))
drawings['pec-deck']=d.finish('Pec-Deck-Maschine','Über Schulterhöhe gelagerte vertikale Drehachsen, schwenkende Armhebel und mehrteilige Griffe. Verstellbarer Sitz mit Rückenpolster und Gewichtsblock.')

def cable(ankle=False):
    d=Drawing();width=70 if ankle else 160;d.base(-29,65,width)
    for y in ([0] if ankle else [65,-65]):
        d.stack(-8,y,199)
        d.beam((31,y,8),(31,y,199),True,4)
        d.beam((-20,y,199),(31,y,199),True,4)
        z=23 if ankle else 114 if y>0 else 79
        for zz in range(26,189,12):d.disc((31,y,zz),1.3,normal='x',color='#667558',width=.6)
        d.box(27,y-7,z-10,9,14,20,True)
        for p in [(-8,y,187),(31,y,187),(35,y,z)]:d.pulley(p,5)
        d.line([(-8,y,106),(-8,y,192),(31,y,192),(35,y,z+5)],GREEN,.95)
        if not ankle:
            d.line([(40,y,z),(68,y,z-10)],GREEN,1)
            d.line([(68,y,z-10),(77,y-10,z-24),(77,y+10,z-24),(68,y,z-10)],GRAY,2)
            d.beam((77,y-10,z-24),(77,y+10,z-24),True,3)
    if not ankle:d.beam((-20,65,199),(-20,-65,199),True,5)
    else:
        # Separate, readable ankle cuff; the cable terminates at its D-ring.
        d.line([(40,0,23),(102,0,19)],GREEN,1.2)
        d.line([(102,0,19),(106,-6,25),(111,0,28),(106,6,25),(102,0,19)],'#9cafa0',1.5)
        for i in range(12):
            a=2*pi*i/12;b=2*pi*(i+1)/12
            d.polygon([(124+16*cos(a),16*sin(a),10),(124+16*cos(b),16*sin(b),10),(124+16*cos(b),16*sin(b),30),(124+16*cos(a),16*sin(a),30)],'#13231e',GRAY,.6)
        d.disc((124,0,30),13,normal='z',color=GREEN,fill='#090d17')
        d.disc((124,0,30),9,normal='z',color=GRAY,fill='#090d17')
        d.box(115,-15,14,11,2,10)
    return d
drawings['cable-tower']=cable().finish('Doppel-Kabelturm','Zwei getrennte Gewichtsblöcke mit Führungsstangen, höhenverstellbaren Rollen und durchgehender Seilführung zu Einhandgriffen.')
drawings['cable-ankle']=cable(True).finish('Tiefer Kabelzug mit Fußmanschette','Einzelner Kabelturm mit bodennaher Umlenkrolle. Das Seil ist durch einen Karabiner und D-Ring mit der separaten gepolsterten Fußmanschette verbunden.')

d=Drawing();d.base(-90,68,97)
for y in [35,-35]:
    d.beam((-45,y,5),(-20,y,130),False,6)
    d.pulley((-20,y,130),10)
    d.beam((-20,y,130),(39,y,165),True,5)
    d.beam((-20,y,130),(-76,y,92),True,4)
    d.plates(-76,y,92,1 if y>0 else -1,23,1)
d.beam((6,0,5),(6,0,53),False,6)
d.pad([(-13,-22,57),(33,-22,57),(33,22,57),(-13,22,57)])
d.pad([(-18,-23,64),(-37,-23,132),(-37,23,132),(-18,23,64)],(-4,0,0))
d.roller(25,0,73,52,6)
d.roller(39,0,165,66,8)
d.beam((39,-35,165),(51,-35,185),True,3)
d.beam((39,35,165),(51,35,185),True,3)
d.beam((51,-35,185),(51,35,185),True,3)
d.beam((16,-31,5),(48,-31,25),False,3)
d.beam((48,-31,25),(48,31,25),True,3)
drawings['pullover']=d.finish('Pullover-Maschine','Scheibenbeladene Maschine mit seitlichen Schulterdrehpunkten. Verbundener Hebel mit Ellenbogenrolle, Überkopfgriff und Gegenarm; Sitz, Rückenpolster und Oberschenkelauflage.')

d=Drawing();d.base(-43,149,92);d.stack(122,26,164)
d.beam((14,0,5),(14,0,53),False,6)
d.pad([(-10,-22,57),(33,-22,57),(33,22,57),(-10,22,57)])
d.beam((61,0,5),(53,0,100),True,5)
d.pad([(46,-18,88),(62,-18,127),(62,18,127),(46,18,88)],(4,0,0))
for y in [43,-43]:
    d.beam((106,y,5),(106,y,68),False,5)
    d.pulley((106,y,68),8)
    d.beam((106,y,68),(63,y,110),True,4)
    d.beam((63,y,110),(57,y,110),True,3)
    d.beam((57,y,100),(57,y,123),True,3)
    d.beam((57,y,110),(57,y+(13 if y>0 else -13),110),True,3)
    d.pad([(46,y-10,14),(70,y-10,30),(70,y+10,30),(46,y+10,14)])
d.line([(106,-43,68),(129,-14,42),(133,26,151),(122,26,106)],'#8cab58',1)
d.pulley((129,-14,42));d.pulley((133,26,151))
drawings['row-machine']=d.finish('Brustgestützte Kraft-Rudermaschine','Sitz und vordere Bruststütze mit getrennten Ruderhebeln und vertikalen sowie breiten Griffpositionen. Fußstützen und Seilübertragung zum Gewichtsblock.')

d=Drawing();d.base(-89,125,114)
for y in [48,-48]:
    d.beam((116,y,5),(116,y,169),False,6)
    d.beam((-21,y,29),(116,y,166),True,5)
    d.beam((-68,y,6),(107,y,155),False,4)
    d.beam((45,y,95),(74,y,124),True,8)
    for x in [-1,22,45]:d.beam((x,y,50+x),(x+7,y,50+x),True,2)
    d.beam((-27,y*.6,36),(-16,y*.6,61),True,3)
d.beam((-55,-35,10),(-55,35,10),False,5)
d.beam((-55,0,10),(-49,0,60),False,5)
d.pad([(-57,-27,36),(-10,-27,36),(-10,27,36),(-57,27,36)])
d.pad([(-57,-27,40),(-88,-27,97),(-88,27,97),(-57,27,40)],(-4,0,0))
d.beam((63,-80,113),(63,80,113),True,4)
for side in [1,-1]:d.plates(63,side*63,113,side,25)
d.pad([(86,-53,96),(45,-53,139),(45,53,139),(86,53,96)],(4,0,3))
for t in [.18,.35,.52,.69,.86]:
    x=86+(45-86)*t;z=96+(139-96)*t
    d.line([(x,-48,z+.5),(x,48,z+.5)],'#66764e',.7)
drawings['leg-press']=d.finish('45-Grad-Beinpresse','Fester Sitz mit geneigter Rückenlehne. Beweglicher Schlitten auf zwei parallelen 45-Grad-Schienen, dazu senkrechte Fußplattform, Scheibenaufnahme und Sicherheitsanschläge.')

d=Drawing();d.base(-64,83,100);d.stack(-43,34,159)
d.beam((-5,0,5),(-5,0,70),False,6)
d.beam((-32,0,5),(-35,0,130),False,4)
d.pad([(-23,-25,76),(40,-25,76),(40,25,76),(-23,25,76)])
d.pad([(-26,-24,82),(-45,-24,141),(-45,24,141),(-26,24,82)],(-4,0,0))
for y in [33,-33]:
    d.beam((40,y,5),(40,y,73),False,4)
    d.pulley((40,y,73),10)
    d.beam((40,y,73),(59,y,25),True,5)
    d.beam((3,y,67),(3,y,88),True,3)
d.roller(59,0,25,64,9)
d.line([(41,-34,65),(20,-34,18),(-43,34,18),(-43,34,151),(-43,34,106)],'#8cab58',1)
d.pulley((20,-34,18));d.pulley((-43,34,151))
drawings['leg-extension']=d.finish('Beinstrecker','Knieachse an der Vorderkante des verstellbaren Sitzes. Nach unten gerichteter Hebel mit Unterschenkelrolle; Rückenpolster, seitliche Haltegriffe, Seil und Gewichtsblock.')

d=Drawing();d.base(-93,119,97);d.stack(88,35,145)
for x,z in [(-71,55),(17,69),(54,59)]:
    d.beam((x,0,5),(x,0,z-4),False,5)
d.beam((-80,0,48),(52,0,53),True,5)
d.pad([(-83,-26,56),(-4,-26,76),(-4,26,76),(-83,26,56)])
d.pad([(-2,-26,76),(54,-26,62),(54,26,62),(-2,26,76)])
for y in [34,-34]:
    d.beam((54,y,5),(54,y,62),False,4)
    d.pulley((54,y,62),9)
    d.beam((54,y,62),(104,y,78),True,4)
    d.beam((-72,y,51),(-72,y,70),True,3)
d.roller(104,0,78,61,9)
d.line([(54,-35,54),(79,-35,19),(88,35,19),(88,35,137),(88,35,106)],'#8cab58',1)
d.pulley((79,-35,19));d.pulley((88,35,137))
drawings['lying-leg-curl']=d.finish('Liegende Beinbeuger-Maschine','Zweigeteilte, an der Hüfte angewinkelte Liegefläche. Knieachse am Polsterende, verbundener Hebel mit Fersenrolle, vordere Haltegriffe und Gewichtsblock.')

d=Drawing();bench(d)
for x,y in [(68,-38),(70,16)]:
    d.beam((x,y-20,14),(x,y+20,14),True,2.5)
    for side in [1,-1]:
        for i in [0,3]:d.disc((x,y+side*(11+i),14),11,fill='#15211e')
        d.disc((x,y+side*15,14),3,color=GRAY)
drawings['dumbbells-bench']=d.finish('Kurzhanteln und verstellbare Trainingsbank','Getrennte Sitz- und Rückenpolster mit Drehpunkt, Stützstrebe und Einstellrastung auf einem standsicheren Untergestell. Zwei vollständige Kurzhanteln neben der Bank.')

d=Drawing();d.beam((0,-113,27),(0,113,27),False,2.8)
for side in [1,-1]:
    d.beam((0,side*68,27),(0,side*111,27),True,4)
    d.plates(0,side*80,27,side,25,3)
    for y in range(20,62,4):d.line([(-1,side*y,27),(1,side*y,27)],'#8cab58',.6)
drawings['barbell']=d.finish('Gerade Langhantel mit Gewichtsscheiben','Durchgehende gerade Griffstange mit Rändelung, drehbaren Aufnahmeschäften und symmetrischen runden Gewichtsscheiben mit Bohrung und Sicherungsringen.')

for filename,svg in drawings.items():
    Path('public/exercises',filename+'.svg').write_text(svg+'\n')
print(f'{len(drawings)} original SVGs generated.')
