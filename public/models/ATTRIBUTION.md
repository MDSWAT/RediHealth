# Anatomical 3D models attribution

This directory contains 3D anatomical assets combining two open-source BodyParts3D reference derivatives:

## 1. Muscular and tendon system (`muscular.glb`)
- Source repository: https://github.com/kelpikz/body-pain-explorer
- Derived work source: Adamas Advanced Designs / Optima (https://www.adamasdesigns.com/licenses)
- Original geometry: BodyParts3D, © The Database Center for Life Science (DBCLS), licensed by the National Bioscience Database Center (NBDC)
- License: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)

## 2. Surface mannequin and internal organ layers (`human-atlas-layers.bin`, `human-atlas-layers.json`)
- Source repository: https://github.com/ashemag/human-atlas
- Original dataset: BodyParts3D 4.0, © The Database Center for Life Science (DBCLS)
- License: Creative Commons Attribution 4.0 International (CC BY 4.0)
- Dataset URL: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html

## 3. Lazy-loaded skeletal system (`human-atlas-skeleton.bin`, `human-atlas-skeleton.json`)
- Source repository: https://github.com/ashemag/human-atlas (pinned upstream commit `1c38bf35c254a891200d3cedecfd57abebe83d8d`)
- Original dataset: BodyParts3D 4.0, © The Database Center for Life Science (DBCLS)
- Publication: Mitsuhashi et al. (2009), BodyParts3D: 3D structure database for anatomical concepts (https://doi.org/10.1093/nar/gkn613)
- License: Creative Commons Attribution 4.0 International (CC BY 4.0) — https://creativecommons.org/licenses/by/4.0/
- Dataset URL: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html
- Adaptations: 269 individual BodyParts3D 4.0 skeletal meshes (cranium, mandible, dental arches, C1–C7/T1–T12/L1–L5 vertebrae and intervertebral discs, sacrum, sternum, 24 ribs and 14 costal cartilages, clavicles, scapulae, pelvic bones, upper and lower limb bones, carpals, hands, and feet) merged into 17 anatomical groups in native meter/Y-up coordinates aligned with `skin_shell`, welded watertight, simplified with `meshoptimizer`, recomputed with angle-weighted signed 16-bit normals, and packed into an indexed binary bundle via `scripts/build-human-atlas-skeleton.mjs`.
