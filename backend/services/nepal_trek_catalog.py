"""Nepal trek catalog — curated, accuracy-focused seed data.

Sources used for typical max altitude / duration / difficulty (cross-checked):
- Nepal Tourism Board TIMS route list (protected-area trek names)
- Published agency comparison tables (altitude, days, difficulty bands)

Difficulty is mapped to TrekPal's three levels: Easy | Moderate | Hard
(Hard covers Challenging / Strenuous / Extreme bands from guide literature).

This is not every footpath in Nepal. It is the set of named, guide-supported
routes a trekker expects in a serious catalog — with typical (not guaranteed)
figures. Always verify permits, seasons, and logistics before travel.
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
    assert difficulty in {"Easy", "Moderate", "Hard"}, name
    assert 1000 <= altitude <= 7000, name
    assert 1 <= days <= 40, name
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


# Typical mid-range itinerary days (not the absolute minimum).
NEPAL_TREK_CATALOG: list[TrekSeed] = [
    # ——— Everest / Khumbu (NTB Everest Region) ———
    _t(
        "Everest Base Camp",
        altitude=5364,
        days=13,
        difficulty="Hard",
        region="Khumbu",
        summary=(
            "Classic teahouse trek from Lukla to Everest Base Camp (5,364 m). Many itineraries "
            "also climb Kala Patthar (~5,545 m) for the sunrise viewpoint. Well supported, high altitude."
        ),
        seasons="Spring · Autumn",
        highlights="Namche acclimatization · Tengboche · EBC · Kala Patthar option",
        image_key="khumbu",
    ),
    _t(
        "Gokyo Lakes",
        altitude=5357,
        days=12,
        difficulty="Hard",
        region="Khumbu",
        summary=(
            "Khumbu lakes trek west of the main EBC trail. High point is usually Gokyo Ri (5,357 m) "
            "with views of Everest, Lhotse, Makalu, and Cho Oyu."
        ),
        seasons="Spring · Autumn",
        highlights="Gokyo Ri 5,357 m · Turquoise lakes · Quieter than EBC corridor",
        image_key="khumbu",
    ),
    _t(
        "Everest Three Passes",
        altitude=5535,
        days=19,
        difficulty="Hard",
        region="Khumbu",
        summary=(
            "Demanding Khumbu loop linking Kongma La, Cho La, and Renjo La with EBC and Gokyo. "
            "Highest pass typically Kongma La (~5,535 m). For experienced high-altitude trekkers."
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
            "Combine Gokyo with Everest Base Camp by crossing Cho La (~5,420 m). More variety "
            "than the standard out-and-back; glacier/pass experience required."
        ),
        seasons="Spring · Autumn",
        highlights="Cho La · Gokyo + EBC · Glacier approaches",
        image_key="khumbu",
    ),
    _t(
        "Gokyo Renjo La",
        altitude=5360,
        days=12,
        difficulty="Hard",
        region="Khumbu",
        summary=(
            "Gokyo Lakes with Renjo La (~5,360 m) exit toward Thame/Namche. Quieter link trail "
            "and big Everest panoramas without the busiest base-camp crowds."
        ),
        seasons="Spring · Autumn",
        highlights="Renjo La · Gokyo Ri · Thame villages",
        image_key="khumbu",
    ),
    _t(
        "Everest View Trek",
        altitude=3880,
        days=6,
        difficulty="Moderate",
        region="Khumbu",
        summary=(
            "Shorter Khumbu introduction toward Namche and the Everest View Hotel ridge "
            "(~3,880 m). Big mountain views without going to Base Camp."
        ),
        seasons="Spring · Autumn",
        highlights="Namche · Everest View Hotel · Shorter Khumbu",
        image_key="khumbu",
    ),
    _t(
        "Ama Dablam Base Camp",
        altitude=4570,
        days=10,
        difficulty="Hard",
        region="Khumbu",
        summary=(
            "Side trail from the EBC corridor to Ama Dablam Base Camp (~4,570 m). Close views "
            "of one of the Himalaya's most iconic peaks; still serious altitude."
        ),
        seasons="Spring · Autumn",
        highlights="Ama Dablam close-up · Pangboche · 4,570 m BC",
        image_key="khumbu",
    ),
    _t(
        "Pikey Peak",
        altitude=4065,
        days=6,
        difficulty="Moderate",
        region="Solukhumbu",
        summary=(
            "Lower Solu ridge trek to Pikey Peak (4,065 m) for broad Everest-range panoramas "
            "without the full EBC altitude profile. Growing lodge network."
        ),
        seasons="Spring · Autumn",
        highlights="4,065 m summit · Everest panorama · Quieter Solu",
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
    _t(
        "Mera Peak",
        altitude=6476,
        days=15,
        difficulty="Hard",
        region="Khumbu",
        summary=(
            "Trekking peak (climbing permit) to Mera Peak (6,476 m). Non-technical for a "
            "Himalayan summit but requires crampons, rope travel, and strong acclimatization."
        ),
        seasons="Spring · Autumn",
        highlights="6,476 m summit · Climbing permit · High camp logistics",
        image_key="khumbu",
    ),
    _t(
        "Island Peak",
        altitude=6189,
        days=16,
        difficulty="Hard",
        region="Khumbu",
        summary=(
            "Popular trekking peak (Imja Tse, 6,189 m), often combined after EBC. Short "
            "technical section near the summit — guide, climbing gear, and permits required."
        ),
        seasons="Spring · Autumn",
        highlights="6,189 m summit · Often after EBC · Climbing section",
        image_key="khumbu",
    ),
    # ——— Annapurna ———
    _t(
        "Annapurna Circuit",
        altitude=5416,
        days=15,
        difficulty="Hard",
        region="Annapurna",
        summary=(
            "Long teahouse circuit around the Annapurna massif. High point Thorong La (5,416 m). "
            "Road building has shortened some sections; classic itineraries still take ~2 weeks."
        ),
        seasons="Spring · Autumn",
        highlights="Thorong La 5,416 m · Manang · Climate change in one trek",
        image_key="annapurna",
    ),
    _t(
        "Annapurna Base Camp",
        altitude=4130,
        days=8,
        difficulty="Moderate",
        region="Annapurna",
        summary=(
            "Trek into the Annapurna Sanctuary to Annapurna Base Camp (4,130 m). Shorter and "
            "lower than EBC, with lodges and amphitheatre mountain views."
        ),
        seasons="Spring · Autumn",
        highlights="Sanctuary 4,130 m · Machhapuchhre · Teahouse trail",
        image_key="annapurna",
    ),
    _t(
        "Poon Hill",
        altitude=3210,
        days=5,
        difficulty="Easy",
        region="Annapurna",
        summary=(
            "Ghorepani–Poon Hill sunrise trek (3,210 m). Ideal first Himalayan trek: lower "
            "altitude, clear lodges, Annapurna and Dhaulagiri views in 4–5 days."
        ),
        seasons="Autumn · Winter · Spring",
        highlights="Poon Hill 3,210 m · Ghorepani · Family-friendly",
        image_key="foothills",
    ),
    _t(
        "Mardi Himal",
        altitude=4500,
        days=6,
        difficulty="Moderate",
        region="Annapurna",
        summary=(
            "Ridge trek to Mardi Himal High Camp / viewpoint (~4,500 m) with close "
            "Machhapuchhre views. Steeper and colder near the top; lodges have expanded."
        ),
        seasons="Spring · Autumn",
        highlights="High Camp ~4,500 m · Ridge walking · Pokhara access",
        image_key="annapurna",
    ),
    _t(
        "Khopra Danda",
        altitude=3660,
        days=8,
        difficulty="Moderate",
        region="Annapurna",
        summary=(
            "Community-lodge ridge trek (Khopra / Khayar area, ~3,660 m) with Dhaulagiri and "
            "Annapurna views. Quieter than ABC; often linked with Poon Hill."
        ),
        seasons="Spring · Autumn",
        highlights="Community lodges · ~3,660 m ridge · Dhaulagiri vista",
        image_key="annapurna",
    ),
    _t(
        "Mohare Danda",
        altitude=3300,
        days=5,
        difficulty="Easy",
        region="Annapurna",
        summary=(
            "Eco-community ridge near Poon Hill (~3,300 m) with sunrise views and quieter "
            "lodges — a good short alternative when Ghorepani is crowded."
        ),
        seasons="Autumn · Winter · Spring",
        highlights="Community tourism · Sunrise ridge · Low altitude",
        image_key="foothills",
    ),
    _t(
        "Tilicho Lake Circuit",
        altitude=5416,
        days=17,
        difficulty="Hard",
        region="Annapurna",
        summary=(
            "Annapurna Circuit variation via Tilicho Lake (~4,919 m lake; itinerary high point "
            "still Thorong La 5,416 m). Extra altitude exposure and buffer days recommended."
        ),
        seasons="Spring · Autumn",
        highlights="Tilicho Lake · Thorong La · Longer circuit",
        image_key="annapurna",
    ),
    _t(
        "Nar Phu Valley",
        altitude=5320,
        days=12,
        difficulty="Hard",
        region="Annapurna",
        summary=(
            "Restricted valleys north of Manang with Tibetan-influenced villages. Often linked "
            "via Kang La (~5,320 m) back toward the Annapurna Circuit. Guide + RAP required."
        ),
        seasons="Spring · Autumn",
        highlights="Restricted permits · Kang La · Ancient villages",
        image_key="remote",
    ),
    _t(
        "Poon Hill and Annapurna Base Camp",
        altitude=4130,
        days=12,
        difficulty="Moderate",
        region="Annapurna",
        summary=(
            "Combined Ghorepani–Poon Hill sunrise with continuation to Annapurna Base Camp "
            "(4,130 m). Popular first 'full' Annapurna itinerary."
        ),
        seasons="Spring · Autumn",
        highlights="Poon Hill + ABC · Teahouse lodges · Classic combo",
        image_key="annapurna",
    ),
    _t(
        "Sikles Trek",
        altitude=2300,
        days=5,
        difficulty="Easy",
        region="Annapurna",
        summary=(
            "Gurung village trails northeast of Pokhara toward Sikles (~2,000–2,300 m). "
            "Cultural mid-hill walking without high-altitude risk."
        ),
        seasons="Autumn · Winter · Spring",
        highlights="Gurung villages · Cultural lodges · Mid-hill views",
        image_key="foothills",
    ),
    # ——— Mustang ———
    _t(
        "Upper Mustang",
        altitude=3840,
        days=12,
        difficulty="Moderate",
        region="Mustang",
        summary=(
            "Restricted rain-shadow trek to the former kingdom of Lo (Lo Manthang ~3,840 m). "
            "Desert cliffs, caves, and monasteries; RAP + agency rules apply."
        ),
        seasons="Spring · Summer · Autumn",
        highlights="Lo Manthang · Rain-shadow desert · Restricted permits",
        image_key="remote",
    ),
    _t(
        "Jomsom Muktinath",
        altitude=3800,
        days=7,
        difficulty="Easy",
        region="Mustang",
        summary=(
            "Lower Mustang / Kali Gandaki corridor toward Muktinath (~3,800 m). Windy valley, "
            "pilgrimage sites; often mixed jeep + walking."
        ),
        seasons="Spring · Autumn · Winter",
        highlights="Muktinath · Kali Gandaki · Flexible logistics",
        image_key="annapurna",
    ),
    _t(
        "Saribung Pass",
        altitude=6042,
        days=20,
        difficulty="Hard",
        region="Mustang",
        summary=(
            "Remote high pass linking Upper Mustang toward Damodar Kund / Nar-Phu side "
            "(Saribung ~6,042 m). Expedition-style; experienced teams only."
        ),
        seasons="Spring · Autumn",
        highlights="Saribung Pass · Restricted wilderness · Camping",
        image_key="remote",
    ),
    # ——— Dhaulagiri ———
    _t(
        "Dhaulagiri Circuit",
        altitude=5360,
        days=20,
        difficulty="Hard",
        region="Dhaulagiri",
        summary=(
            "Full camping circuit around Dhaulagiri with high passes (French Pass / Hidden "
            "Valley area ~5,360 m). Not a teahouse trek — serious logistics required."
        ),
        seasons="Autumn · Spring",
        highlights="French Pass · Hidden Valley · Expedition camping",
        image_key="remote",
    ),
    # ——— Langtang / Helambu / Tamang / Ganesh ———
    _t(
        "Langtang Valley",
        altitude=3870,
        days=8,
        difficulty="Moderate",
        region="Langtang",
        summary=(
            "Valley trek north of Kathmandu to Kyanjin Gompa area (~3,870 m typical high "
            "settlement). Optional viewpoints higher; shorter approach than Khumbu."
        ),
        seasons="Spring · Autumn",
        highlights="Kyanjin Gompa · Close mountain walls · Kathmandu access",
        image_key="langtang",
    ),
    _t(
        "Gosainkunda Lake",
        altitude=4380,
        days=8,
        difficulty="Moderate",
        region="Langtang",
        summary=(
            "Sacred alpine lakes trek to Gosainkunda (4,380 m). Steep days and cold nights; "
            "busy around Janai Purnima pilgrimage."
        ),
        seasons="Spring · Autumn",
        highlights="Gosainkunda 4,380 m · Lauribina · Pilgrimage season",
        image_key="langtang",
    ),
    _t(
        "Langtang Gosainkunda Helambu",
        altitude=4610,
        days=14,
        difficulty="Hard",
        region="Langtang",
        summary=(
            "Combined Langtang Valley, Gosainkunda, and Helambu exit via Lauribina Pass "
            "(~4,610 m). Varied culture and landscapes in one itinerary."
        ),
        seasons="Spring · Autumn",
        highlights="Three regions · Lauribina Pass · Village variety",
        image_key="langtang",
    ),
    _t(
        "Helambu Circuit",
        altitude=3640,
        days=6,
        difficulty="Easy",
        region="Helambu",
        summary=(
            "Lower trails east of Kathmandu through Hyolmo villages (typical max ~3,640 m). "
            "Gentle introduction; optional links toward Gosainkunda."
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
            "Cultural trail west of Syabrubesi with Tamang villages, hot springs, and "
            "homestays. Lower altitude community tourism focus."
        ),
        seasons="Autumn · Winter · Spring",
        highlights="Homestays · Tatopani springs · Cultural immersion",
        image_key="foothills",
    ),
    _t(
        "Tamang Heritage and Langtang",
        altitude=3870,
        days=12,
        difficulty="Moderate",
        region="Langtang",
        summary=(
            "Combine Tamang Heritage cultural days with the Langtang Valley to Kyanjin "
            "(~3,870 m). Culture first, then classic valley mountains."
        ),
        seasons="Spring · Autumn",
        highlights="Heritage + Langtang · Homestays · Kyanjin",
        image_key="langtang",
    ),
    _t(
        "Ganja La Pass",
        altitude=5122,
        days=12,
        difficulty="Hard",
        region="Langtang",
        summary=(
            "High pass (~5,122 m) linking Langtang with Helambu. Snow and camping sections "
            "are common — experienced trekkers with guide and flexible weather window."
        ),
        seasons="Spring · Autumn",
        highlights="Ganja La 5,122 m · Wilder Langtang · Camping",
        image_key="langtang",
    ),
    _t(
        "Ruby Valley Ganesh Himal",
        altitude=3830,
        days=9,
        difficulty="Moderate",
        region="Ganesh Himal",
        summary=(
            "Ganesh Himal / Ruby Valley community trails (typical max ~3,830 m). Quiet "
            "mid-hill and high-hill walking between Langtang and Manaslu corridors."
        ),
        seasons="Spring · Autumn",
        highlights="Ganesh Himal views · Community lodges · Off-main-trail",
        image_key="langtang",
    ),
    _t(
        "Panch Pokhari",
        altitude=4100,
        days=10,
        difficulty="Moderate",
        region="Helambu",
        summary=(
            "Sacred five-lakes trek east of Kathmandu toward Panch Pokhari (~4,100 m). "
            "Quieter pilgrimage and ridge walking than the classic Gosainkunda trail."
        ),
        seasons="Spring · Autumn",
        highlights="Five sacred lakes · Ridge camps · Quieter east",
        image_key="langtang",
    ),
    # ——— Manaslu / Tsum ———
    _t(
        "Manaslu Circuit",
        altitude=5106,
        days=15,
        difficulty="Hard",
        region="Manaslu",
        summary=(
            "Restricted-area circuit around Manaslu crossing Larkya La (~5,106 m). Fewer "
            "crowds than Annapurna; RAP + conservation permits and licensed guide required."
        ),
        seasons="Spring · Autumn",
        highlights="Larkya La 5,106 m · Restricted area · Tibetan-influenced villages",
        image_key="remote",
    ),
    _t(
        "Tsum Valley",
        altitude=3700,
        days=16,
        difficulty="Hard",
        region="Manaslu",
        summary=(
            "Sacred restricted side valley off the Manaslu trail (typical high villages "
            "~3,700 m). Monasteries and culture-focused days; often combined with Manaslu."
        ),
        seasons="Spring · Autumn",
        highlights="Restricted RAP · Monasteries · Cultural depth",
        image_key="remote",
    ),
    _t(
        "Manaslu Circuit with Tsum Valley",
        altitude=5106,
        days=18,
        difficulty="Hard",
        region="Manaslu",
        summary=(
            "Full Manaslu Circuit plus Tsum Valley detour. Longer permits window and the "
            "same Larkya La (~5,106 m) challenge."
        ),
        seasons="Spring · Autumn",
        highlights="Tsum + Larkya La · Extended culture · Restricted permits",
        image_key="remote",
    ),
    # ——— Makalu / Kanchenjunga / Rolwaling ———
    _t(
        "Makalu Base Camp",
        altitude=4870,
        days=20,
        difficulty="Hard",
        region="Makalu",
        summary=(
            "Remote eastern trek to Makalu Base Camp (~4,870 m). Wilder logistics and fewer "
            "lodges than Khumbu; Barun Valley wilderness."
        ),
        seasons="Spring · Autumn",
        highlights="Makalu BC 4,870 m · Barun Valley · Remote",
        image_key="remote",
    ),
    _t(
        "Kanchenjunga Base Camp",
        altitude=5143,
        days=24,
        difficulty="Hard",
        region="Kanchenjunga",
        summary=(
            "Far-east trek toward Kanchenjunga Base Camp options (north Pangpema ~5,143 m "
            "common high point). Long, remote, usually camping-supported; RAP sections."
        ),
        seasons="Spring · Autumn",
        highlights="Pangpema ~5,143 m · 3+ weeks · Extreme remoteness",
        image_key="remote",
    ),
    _t(
        "Kanchenjunga North and South",
        altitude=5143,
        days=26,
        difficulty="Hard",
        region="Kanchenjunga",
        summary=(
            "Combined north and south Kanchenjunga base approaches via Sele La / high "
            "passes. One of Nepal's longest and hardest teahouse/camping hybrids."
        ),
        seasons="Spring · Autumn",
        highlights="North + South BC · Sele La · Multi-week expedition feel",
        image_key="remote",
    ),
    _t(
        "Lumba Sumba Pass",
        altitude=5177,
        days=22,
        difficulty="Hard",
        region="Kanchenjunga",
        summary=(
            "Remote eastern pass trek (Lumba Sumba ~5,177 m) linking Kanchenjunga country "
            "toward Makalu approaches. Camping, permits, and strong logistics essential."
        ),
        seasons="Spring · Autumn",
        highlights="Lumba Sumba Pass · Far-east wilderness · Camping",
        image_key="remote",
    ),
    _t(
        "Rolwaling Valley",
        altitude=5755,
        days=16,
        difficulty="Hard",
        region="Rolwaling",
        summary=(
            "Wild valley between Langtang and Khumbu. Tashi Lapcha / Tashi Labtsa (~5,755 m) "
            "link toward Thame is technical glacier travel — not a casual teahouse trek."
        ),
        seasons="Spring · Autumn",
        highlights="Tashi Lapcha · Remote villages · Glacier travel",
        image_key="remote",
    ),
    # ——— Dolpo / Humla / Far West / Lakes ———
    _t(
        "Upper Dolpo",
        altitude=5400,
        days=22,
        difficulty="Hard",
        region="Dolpo",
        summary=(
            "High arid west Nepal toward Shey and beyond (passes often ~5,200–5,400 m). "
            "Restricted, expensive RAP, camping — for experienced remote trekkers."
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
            "Dolpo circuits via Phoksundo Lake and surrounding passes (high points often "
            "~5,000–5,300 m). Still remote camping country with strong cultural character."
        ),
        seasons="Spring · Autumn",
        highlights="Phoksundo Lake · Bon culture · Camping logistics",
        image_key="remote",
    ),
    _t(
        "Upper Dolpo to Jomsom",
        altitude=5400,
        days=25,
        difficulty="Hard",
        region="Dolpo",
        summary=(
            "Long traverse linking Upper Dolpo toward Mustang / Jomsom. Multi-week "
            "restricted camping itinerary with complex permits."
        ),
        seasons="Spring · Autumn",
        highlights="Dolpo–Mustang link · High passes · Expedition length",
        image_key="remote",
    ),
    _t(
        "Rara Lake",
        altitude=2990,
        days=10,
        difficulty="Moderate",
        region="Mugu",
        summary=(
            "Trek to Rara Lake (~2,990 m), Nepal's largest lake, in the remote northwest. "
            "Forest approaches via Jumla or flights; quieter than central Nepal classics."
        ),
        seasons="Spring · Autumn",
        highlights="Rara Lake 2,990 m · National park · Quiet northwest",
        image_key="remote",
    ),
    _t(
        "Khaptad National Park",
        altitude=3200,
        days=8,
        difficulty="Easy",
        region="Far West",
        summary=(
            "Far-West plateau grasslands and pilgrimage sites (~3,000–3,200 m). Lower "
            "altitude nature and culture trek far from Annapurna/Khumbu crowds."
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
            "Remote Far-West approach toward Api Himal (~4,000 m camps common). Sparse "
            "infrastructure — experienced local support recommended."
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
            "Northwestern borderlands near Tibet (passes often ~4,500–4,950 m). Restricted "
            "/ logistically complex — plan early with a specialist agency."
        ),
        seasons="Spring · Autumn",
        highlights="Limi Valley · Border culture · High remote passes",
        image_key="remote",
    ),
    # ——— Short / near cities ———
    _t(
        "Panchase Trek",
        altitude=2500,
        days=4,
        difficulty="Easy",
        region="Pokhara",
        summary=(
            "Short ridge trek near Pokhara (~2,500 m) with Annapurna sunrise views. Ideal "
            "weekend escape or warm-up before a longer trail."
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
            "Easy overnight trails above Pokhara through Dhampus and Australian Camp "
            "(~2,050–2,100 m). Beginner-friendly Machhapuchhre views."
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
            "Kathmandu rim trek via Chisapani and Nagarkot viewpoints (~2,200 m). Low "
            "altitude with easy transport links back to the city."
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
            "Shivapuri National Park routes on the Kathmandu rim (park high point 2,732 m). "
            "Cool forest day or overnight toward Chisapani."
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
            "Low foothill route east of Pokhara (max ~1,700 m) once associated with royal "
            "guests. Village stays and Annapurna views without altitude stress."
        ),
        seasons="Autumn · Winter · Spring",
        highlights="Village culture · Low altitude · Pokhara start",
        image_key="foothills",
    ),
]


def catalog_trek_names() -> set[str]:
    return {t["trek_name"] for t in NEPAL_TREK_CATALOG}
