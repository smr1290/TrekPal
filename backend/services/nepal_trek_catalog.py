"""Nepal trek catalog seed data.

TrekPal keeps destinations freeform for planning, but the Treks page needs a
rich catalog of real Nepal routes — not only the original five demos.

This is a curated list of well-known, bookable/guide-supported treks across
regions. It is intentionally not "every trail in Nepal" (hundreds of local
paths exist); it aims for the routes a first-time or returning trekker would
expect to browse.
"""

from __future__ import annotations

from typing import TypedDict

from services.catalog_media import CREDIT


class TrekSeed(TypedDict):
    trek_name: str
    max_altitude: int
    typical_duration: int
    difficulty: str
    region: str
    summary: str
    best_seasons: str
    highlights: str
    image_url: str
    image_credit: str


# Reuse the five High Lodge catalog photos by region so new cards never look empty.
_IMG = {
    "khumbu": "/catalog/treks/everest-base-camp.jpg",
    "annapurna": "/catalog/treks/annapurna-circuit.jpg",
    "langtang": "/catalog/treks/langtang-valley.jpg",
    "foothills": "/catalog/treks/poon-hill.jpg",
    "remote": "/catalog/treks/manaslu-circuit.jpg",
}


def _t(
    name: str,
    *,
    altitude: int,
    days: int,
    difficulty: str,
    region: str,
    summary: str,
    seasons: str,
    highlights: str,
    image_key: str,
) -> TrekSeed:
    return {
        "trek_name": name,
        "max_altitude": altitude,
        "typical_duration": days,
        "difficulty": difficulty,
        "region": region,
        "summary": summary,
        "best_seasons": seasons,
        "highlights": highlights,
        "image_url": _IMG[image_key],
        "image_credit": CREDIT,
    }


# Original five kept first (migration updates-or-inserts by name).
NEPAL_TREK_CATALOG: list[TrekSeed] = [
    # —— Khumbu / Everest ——
    _t(
        "Everest Base Camp",
        altitude=5364,
        days=14,
        difficulty="Hard",
        region="Khumbu",
        summary=(
            "Nepal's classic high trail to the foot of Everest. Gradual ascent from Lukla with "
            "teahouse lodges, Sherpa villages, and big mountain views — demanding but well supported."
        ),
        seasons="Spring · Autumn",
        highlights="Namche rest days · Tengboche monastery · Kala Patthar sunrise",
        image_key="khumbu",
    ),
    _t(
        "Gokyo Lakes",
        altitude=5360,
        days=12,
        difficulty="Hard",
        region="Khumbu",
        summary=(
            "Turquoise high lakes west of the main EBC trail, with Gokyo Ri views of Everest, "
            "Lhotse, Makalu, and Cho Oyu. Often quieter than the classic base-camp route."
        ),
        seasons="Spring · Autumn",
        highlights="Gokyo Ri · Cho Oyu vista · Ngozumpa glacier",
        image_key="khumbu",
    ),
    _t(
        "Everest Three Passes",
        altitude=5535,
        days=18,
        difficulty="Hard",
        region="Khumbu",
        summary=(
            "A demanding Khumbu loop linking Kongma La, Cho La, and Renjo La with EBC and Gokyo. "
            "For strong trekkers who want passes, glaciers, and variety in one journey."
        ),
        seasons="Spring · Autumn",
        highlights="Kongma La · Cho La · Renjo La · EBC + Gokyo",
        image_key="khumbu",
    ),
    _t(
        "Everest Base Camp via Cho La",
        altitude=5420,
        days=16,
        difficulty="Hard",
        region="Khumbu",
        summary=(
            "Combine Gokyo Lakes with Everest Base Camp by crossing Cho La. Extra challenge, "
            "extra scenery, and a fuller Khumbu experience than the standard out-and-back."
        ),
        seasons="Spring · Autumn",
        highlights="Cho La crossing · Dual valleys · Glacier approaches",
        image_key="khumbu",
    ),
    _t(
        "Ama Dablam Base Camp",
        altitude=4570,
        days=10,
        difficulty="Moderate",
        region="Khumbu",
        summary=(
            "Side trail from the EBC corridor to the foot of Ama Dablam — one of the world's "
            "most photographed peaks. Shorter than full EBC but still serious altitude."
        ),
        seasons="Spring · Autumn",
        highlights="Ama Dablam close-up · Pangboche · Optional climb approaches",
        image_key="khumbu",
    ),
    _t(
        "Renjo La Pass",
        altitude=5360,
        days=11,
        difficulty="Hard",
        region="Khumbu",
        summary=(
            "Cross Renjo La between the Gokyo valley and Thame/Namche for quieter trails and "
            "panoramic Everest views without the busiest base-camp crowds."
        ),
        seasons="Spring · Autumn",
        highlights="Renjo La panorama · Thame village · Quieter Khumbu link",
        image_key="khumbu",
    ),
    # —— Annapurna ——
    _t(
        "Annapurna Circuit",
        altitude=5416,
        days=15,
        difficulty="Hard",
        region="Annapurna",
        summary=(
            "A long loop around the Annapurna massif through rice terraces, pine forest, and "
            "high desert. Crosses Thorong La — one of the world's famous trek passes."
        ),
        seasons="Spring · Autumn",
        highlights="Manang acclimatization · Thorong La · Changing climates in one trek",
        image_key="annapurna",
    ),
    _t(
        "Annapurna Base Camp",
        altitude=4130,
        days=10,
        difficulty="Moderate",
        region="Annapurna",
        summary=(
            "Walk into the Annapurna Sanctuary amphitheatre with walls of ice and rock all around. "
            "Shorter and lower than EBC, still a classic Nepal goal trek."
        ),
        seasons="Spring · Autumn",
        highlights="Sanctuary amphitheatre · Machhapuchhre views · Teahouse trail",
        image_key="annapurna",
    ),
    _t(
        "Poon Hill",
        altitude=3210,
        days=5,
        difficulty="Easy",
        region="Annapurna",
        summary=(
            "A short foothills trek famous for sunrise over Annapurna and Dhaulagiri. Ideal "
            "first Himalayan trek — lower altitude, clear lodges, big reward for few days."
        ),
        seasons="Autumn · Winter · Spring",
        highlights="Ghorepani lodges · Poon Hill viewpoint · Family-friendly duration",
        image_key="foothills",
    ),
    _t(
        "Mardi Himal",
        altitude=4500,
        days=7,
        difficulty="Moderate",
        region="Annapurna",
        summary=(
            "Ridge trek toward Mardi Himal with close Machhapuchhre views and fewer crowds than "
            "ABC. Lodge infrastructure has grown quickly — still steeper and colder near the top."
        ),
        seasons="Spring · Autumn",
        highlights="High Camp sunrise · Ridge walking · Pokhara access",
        image_key="annapurna",
    ),
    _t(
        "Khopra Danda",
        altitude=3660,
        days=8,
        difficulty="Moderate",
        region="Annapurna",
        summary=(
            "Community lodge trek above the Kali Gandaki with Dhaulagiri and Annapurna views, "
            "often combined with Poon Hill or Khayar Lake side trips."
        ),
        seasons="Spring · Autumn",
        highlights="Community lodges · Dhaulagiri vista · Quieter than ABC",
        image_key="annapurna",
    ),
    _t(
        "Mohare Danda",
        altitude=3300,
        days=5,
        difficulty="Easy",
        region="Annapurna",
        summary=(
            "Eco-community ridge alternative near Poon Hill with sunrise views and quieter lodges. "
            "Good short trek if Ghorepani feels too busy."
        ),
        seasons="Autumn · Winter · Spring",
        highlights="Community tourism · Sunrise ridge · Low altitude intro",
        image_key="foothills",
    ),
    _t(
        "Tilicho Lake",
        altitude=4919,
        days=12,
        difficulty="Hard",
        region="Annapurna",
        summary=(
            "Side journey from the Annapurna Circuit to one of the world's highest lakes. Extra "
            "altitude, wind, and exposure — plan buffer days and strong fitness."
        ),
        seasons="Spring · Autumn",
        highlights="Tilicho Lake · High camp nights · Circuit add-on",
        image_key="annapurna",
    ),
    _t(
        "Nar Phu Valley",
        altitude=5320,
        days=12,
        difficulty="Hard",
        region="Annapurna",
        summary=(
            "Restricted-area valleys north of Manang with Tibetan-influenced villages and the "
            "Kang La pass link back toward the Circuit. Permits and guide rules apply."
        ),
        seasons="Spring · Autumn",
        highlights="Restricted permits · Kang La · Ancient villages",
        image_key="remote",
    ),
    _t(
        "Upper Mustang",
        altitude=4200,
        days=12,
        difficulty="Moderate",
        region="Mustang",
        summary=(
            "Desert plateau north of the Annapurna barrier toward the old kingdom of Lo. "
            "Restricted area with dramatic cliffs, caves, and Tibetan Buddhist culture."
        ),
        seasons="Spring · Summer · Autumn",
        highlights="Lo Manthang · Rain-shadow landscapes · Restricted permits",
        image_key="remote",
    ),
    _t(
        "Jomsom Muktinath",
        altitude=3800,
        days=7,
        difficulty="Easy",
        region="Mustang",
        summary=(
            "Classic lower Mustang / Kali Gandaki corridor from Pokhara toward Muktinath. "
            "Windy valley floors, apple orchards, and pilgrimage sites — often done partly by jeep."
        ),
        seasons="Spring · Autumn · Winter",
        highlights="Muktinath temple · Kali Gandaki gorge · Flexible logistics",
        image_key="annapurna",
    ),
    _t(
        "Dhaulagiri Circuit",
        altitude=5360,
        days=18,
        difficulty="Hard",
        region="Dhaulagiri",
        summary=(
            "Remote camping circuit around Dhaulagiri with high passes and serious logistics. "
            "Not a teahouse trek — experienced teams, porters, and contingency days required."
        ),
        seasons="Spring · Autumn",
        highlights="French Pass · Hidden Valley · Expedition-style camping",
        image_key="remote",
    ),
    # —— Langtang / Helambu / Tamang ——
    _t(
        "Langtang Valley",
        altitude=5000,
        days=9,
        difficulty="Moderate",
        region="Langtang",
        summary=(
            "A quieter valley north of Kathmandu with Tamang culture, glaciers, and close "
            "mountain walls. Shorter than EBC but still serious altitude once you climb."
        ),
        seasons="Spring · Autumn",
        highlights="Kyanjin Gompa · Cheese factory stop · Closer access from Kathmandu",
        image_key="langtang",
    ),
    _t(
        "Gosainkunda Lake",
        altitude=4380,
        days=8,
        difficulty="Moderate",
        region="Langtang",
        summary=(
            "Sacred alpine lakes on the ridge between Langtang and Helambu. Steep days, cold "
            "nights, and big Hindu–Buddhist pilgrimage energy — especially around Janai Purnima."
        ),
        seasons="Spring · Autumn",
        highlights="Sacred lakes · Lauribina Pass · Pilgrimage season",
        image_key="langtang",
    ),
    _t(
        "Langtang Gosainkunda Helambu",
        altitude=4610,
        days=14,
        difficulty="Hard",
        region="Langtang",
        summary=(
            "Combine Langtang Valley with Gosainkunda and exit through Helambu for a full "
            "central-Nepal circuit with varied culture and landscapes."
        ),
        seasons="Spring · Autumn",
        highlights="Three regions · Lauribina · Village variety",
        image_key="langtang",
    ),
    _t(
        "Helambu Circuit",
        altitude=3650,
        days=7,
        difficulty="Easy",
        region="Helambu",
        summary=(
            "Lower trails east of Kathmandu through Hyolmo/Sherpa villages and rhododendron "
            "forest. A gentle introduction with optional links toward Gosainkunda."
        ),
        seasons="Autumn · Winter · Spring",
        highlights="Close to Kathmandu · Village lodges · Forest ridges",
        image_key="foothills",
    ),
    _t(
        "Tamang Heritage Trail",
        altitude=2600,
        days=6,
        difficulty="Easy",
        region="Langtang",
        summary=(
            "Cultural trail west of Syabrubesi highlighting Tamang villages, hot springs, and "
            "homestays — lower altitude and strong community tourism focus."
        ),
        seasons="Autumn · Winter · Spring",
        highlights="Homestays · Tatopani springs · Cultural immersion",
        image_key="foothills",
    ),
    _t(
        "Ganja La Pass",
        altitude=5122,
        days=12,
        difficulty="Hard",
        region="Langtang",
        summary=(
            "High pass linking Langtang with Helambu. Snow and camping sections are common — "
            "best for experienced trekkers with a guide and flexible weather window."
        ),
        seasons="Spring · Autumn",
        highlights="Ganja La · Wilder Langtang · Camping sections",
        image_key="langtang",
    ),
    # —— Manaslu / Tsum ——
    _t(
        "Manaslu Circuit",
        altitude=5160,
        days=14,
        difficulty="Hard",
        region="Manaslu",
        summary=(
            "A remote restricted-area circuit around the world's eighth-highest peak. Fewer "
            "crowds than Annapurna, wilder villages, and a serious Larkya La crossing."
        ),
        seasons="Spring · Autumn",
        highlights="Restricted permits · Tibetan-influenced villages · Larkya La pass",
        image_key="remote",
    ),
    _t(
        "Tsum Valley",
        altitude=3700,
        days=12,
        difficulty="Moderate",
        region="Manaslu",
        summary=(
            "Sacred side valley off the Manaslu trail with ancient monasteries and restricted "
            "access. Quieter cultural focus; often combined with part of the Manaslu Circuit."
        ),
        seasons="Spring · Autumn",
        highlights="Restricted area · Monasteries · Cultural depth",
        image_key="remote",
    ),
    _t(
        "Manaslu Circuit with Tsum Valley",
        altitude=5160,
        days=18,
        difficulty="Hard",
        region="Manaslu",
        summary=(
            "Full Manaslu Circuit plus Tsum Valley detour. Longer itinerary, richer culture, "
            "and the same Larkya La challenge — plan permits carefully."
        ),
        seasons="Spring · Autumn",
        highlights="Tsum + Larkya La · Extended culture · Restricted permits",
        image_key="remote",
    ),
    # —— Makalu / Kanchenjunga / Rolwaling ——
    _t(
        "Makalu Base Camp",
        altitude=4870,
        days=18,
        difficulty="Hard",
        region="Makalu",
        summary=(
            "Remote eastern trek toward Makalu, the world's fifth-highest peak. Wilder logistics, "
            "fewer lodges than Khumbu, and outstanding wilderness."
        ),
        seasons="Spring · Autumn",
        highlights="Makalu views · Barun Valley · Remote camping/lodges",
        image_key="remote",
    ),
    _t(
        "Kanchenjunga Base Camp",
        altitude=5143,
        days=20,
        difficulty="Hard",
        region="Kanchenjunga",
        summary=(
            "Far-east trek toward the world's third-highest massif. Long approaches, restricted "
            "sections, and serious remoteness — usually guided with camping support."
        ),
        seasons="Spring · Autumn",
        highlights="North/South base options · Remote villages · Big-wall views",
        image_key="remote",
    ),
    _t(
        "Rolwaling Valley",
        altitude=5755,
        days=16,
        difficulty="Hard",
        region="Rolwaling",
        summary=(
            "Wild valley between Langtang and Khumbu, often linked via Tashi Lapcha toward "
            "Thame. Technical glacier sections — not a casual teahouse trek."
        ),
        seasons="Spring · Autumn",
        highlights="Tashi Lapcha · Remote villages · Glacier travel",
        image_key="remote",
    ),
    # —— Dolpo / Far West / Lakes ——
    _t(
        "Upper Dolpo",
        altitude=5400,
        days=22,
        difficulty="Hard",
        region="Dolpo",
        summary=(
            "High, arid, culturally Tibetan west Nepal. Restricted camping trek through Shey "
            "and beyond — expensive permits, long days, unforgettable emptiness."
        ),
        seasons="Spring · Autumn",
        highlights="Shey Gompa · High passes · Restricted wilderness",
        image_key="remote",
    ),
    _t(
        "Lower Dolpo",
        altitude=5300,
        days=16,
        difficulty="Hard",
        region="Dolpo",
        summary=(
            "Slightly more accessible Dolpo circuiting Phoksundo and surrounding valleys. Still "
            "remote camping country with strong cultural character."
        ),
        seasons="Spring · Autumn",
        highlights="Phoksundo Lake · Bon culture · Camping logistics",
        image_key="remote",
    ),
    _t(
        "Rara Lake",
        altitude=3700,
        days=10,
        difficulty="Moderate",
        region="Mugu",
        summary=(
            "Trek to Nepal's largest lake in the remote northwest. Forests, meadows, and a "
            "quiet shoreline — logistics via Jumla or air links need planning."
        ),
        seasons="Spring · Autumn",
        highlights="Rara Lake · National park · Quiet northwest",
        image_key="remote",
    ),
    _t(
        "Khaptad National Park",
        altitude=3200,
        days=8,
        difficulty="Easy",
        region="Far West",
        summary=(
            "Plateau grasslands and pilgrimage sites in Far-West Nepal. Lower altitude cultural "
            "and nature trek far from the classic Annapurna/Khumbu crowds."
        ),
        seasons="Spring · Autumn",
        highlights="Khaptad plateau · Ashram · Off-the-beaten-path",
        image_key="foothills",
    ),
    _t(
        "Api Base Camp",
        altitude=4000,
        days=12,
        difficulty="Hard",
        region="Far West",
        summary=(
            "Remote Far-West approach toward Api Himal. Few trekkers, basic infrastructure, "
            "and a true wilderness feel — best with experienced local support."
        ),
        seasons="Spring · Autumn",
        highlights="Api Himal · Far-West wilderness · Sparse lodges",
        image_key="remote",
    ),
    _t(
        "Humla Limi Valley",
        altitude=4950,
        days=18,
        difficulty="Hard",
        region="Humla",
        summary=(
            "Northwestern borderlands near Tibet with high passes and distinctive culture. "
            "Restricted/logistically complex — plan early with a specialist agency."
        ),
        seasons="Spring · Autumn",
        highlights="Limi Valley · Border culture · High remote passes",
        image_key="remote",
    ),
    # —— Short / near cities ——
    _t(
        "Panchase Trek",
        altitude=2500,
        days=4,
        difficulty="Easy",
        region="Pokhara",
        summary=(
            "Short ridge trek near Pokhara with Annapurna sunrise views and village lodges. "
            "Ideal weekend escape or warm-up before a longer trail."
        ),
        seasons="Autumn · Winter · Spring",
        highlights="Pokhara access · Sunrise views · Short duration",
        image_key="foothills",
    ),
    _t(
        "Australian Camp Dhampus",
        altitude=2100,
        days=3,
        difficulty="Easy",
        region="Pokhara",
        summary=(
            "Easy overnight trails above Pokhara through Dhampus and Australian Camp. Great "
            "first night in the hills with Machhapuchhre views."
        ),
        seasons="Autumn · Winter · Spring",
        highlights="Beginner friendly · Mountain views · Near Pokhara",
        image_key="foothills",
    ),
    _t(
        "Nagarkot Chisapani",
        altitude=2200,
        days=3,
        difficulty="Easy",
        region="Kathmandu Valley",
        summary=(
            "Classic Kathmandu Valley edge trek via Chisapani and Nagarkot viewpoints. Low "
            "altitude, frequent lodges, and easy bus/taxi links back to the city."
        ),
        seasons="Autumn · Winter · Spring",
        highlights="Valley views · Sunrise points · Near Kathmandu",
        image_key="foothills",
    ),
    _t(
        "Shivapuri Chisapani",
        altitude=2732,
        days=2,
        difficulty="Easy",
        region="Kathmandu Valley",
        summary=(
            "National-park day or overnight routes from the Kathmandu rim through Shivapuri "
            "forest toward Chisapani. Cool, green, and close to home base."
        ),
        seasons="Autumn · Winter · Spring",
        highlights="National park · Forest trails · Short escape",
        image_key="foothills",
    ),
    _t(
        "Royal Trek",
        altitude=1700,
        days=4,
        difficulty="Easy",
        region="Pokhara",
        summary=(
            "Low foothill route east of Pokhara once favored by royal guests. Village stays, "
            "easy walking, and Annapurna views without high altitude."
        ),
        seasons="Autumn · Winter · Spring",
        highlights="Village culture · Low altitude · Pokhara start",
        image_key="foothills",
    ),
    _t(
        "Sikles Trek",
        altitude=2300,
        days=5,
        difficulty="Easy",
        region="Annapurna",
        summary=(
            "Gurung village trails northeast of Pokhara toward Sikles. Cultural focus, "
            "moderate hills, and a quieter alternative to Poon Hill."
        ),
        seasons="Autumn · Winter · Spring",
        highlights="Gurung villages · Cultural lodges · Mid-hill views",
        image_key="foothills",
    ),
    _t(
        "Pikey Peak",
        altitude=4065,
        days=7,
        difficulty="Moderate",
        region="Solukhumbu",
        summary=(
            "Lower Solu ridge famous for broad Everest panoramas without going to Base Camp. "
            "Strong sunrise/sunset viewpoint trek with growing lodge options."
        ),
        seasons="Spring · Autumn",
        highlights="Everest panorama · Quieter Solu · Viewpoint camps",
        image_key="khumbu",
    ),
    _t(
        "Dudh Kunda",
        altitude=4600,
        days=10,
        difficulty="Moderate",
        region="Solukhumbu",
        summary=(
            "Sacred lakes trek in lower Solukhumbu with Everest-range views and pilgrimage "
            "sites. Less crowded than the classic Lukla corridor."
        ),
        seasons="Spring · Autumn",
        highlights="Sacred lakes · Solu culture · Mountain panoramas",
        image_key="khumbu",
    ),
]


def catalog_trek_names() -> set[str]:
    return {t["trek_name"] for t in NEPAL_TREK_CATALOG}
