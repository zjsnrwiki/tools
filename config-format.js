var shipType = [ '', 'CV', 'CVL', 'AV', 'BB', 'BBV', 'BC', 'CA', 'CAV', 'CLT', 'CL', 'BM', 'DD', 'SSV', 'SS', 'SC', 'AP' ];

var remodelPostfix = null;
var cannotEquip = null;
var noEquipt = null;
var countryName = null;
var dialogueTitle = null;
var modCore = null;
var rangeName = null;

var shipByIndex = { };
var equiptByCid = { };
var skillsByTypeId = { };

function getShipName(ship) {
    var name = ship.title.trim();
    var idx = ship.shipIndex;
    if (idx > 1000 && shipByIndex[idx % 1000].title.trim() == name)
        name += remodelPostfix;
    return name;
}

function getShipAttr(ship) {
    var ret = "ships['" + getShipName(ship) + "'] = {\n    ";

    ret += "index=" + parseInt(ship.shipIndex) + ", ";
    ret += "rarity=" + ship.star + ", ";

    ret += "type='" + shipType[ship.type] + "', ";
    ret += "country='" + countryName[parseInt(ship.country)] + "', ";
    ret += "class='" + ship.classNo + "', ";

    if (ship.skills.length > 0)
        ret += "skill='" + skillsByTypeId[ship.skills[0]][0].title + "', ";
    if (ship.skills.length > 1)
        ret += "skill2='" + skillsByTypeId[ship.skills[1]][0].title + "', ";

    ret = ret.slice(0, -1) + '\n    ';

    ret += "hp=" + ship.hp + ", ";
    ret += "atk=" + ship.atk + ", ";
    ret += "tpd=" + ship.torpedo + ", ";
    ret += "def=" + ship.def + ", ";
    ret += "aa=" + ship.airDef + ", ";
    ret += "eva=" + ship.miss + ", ";
    ret += "as=" + ship.antisub + ", ";
    ret += "rec=" + ship.radar + ", ";
    ret += "speed=" + ship.speed + ", ";
    ret += "luck=" + ship.luck + ", ";
    ret += "range='" + rangeName[ship.range] + "', ";

    ret = ret.slice(0, -1) + '\n    ';

    var st = ship.strengthenTop;
    var exp = ship.strengthenLevelUpExp;

    ret += "atkMax=" + Math.floor(ship.atk + st.atk / exp) + ", ";
    ret += "tpdMax=" + Math.floor(ship.torpedo + st.torpedo / exp) + ", ";
    ret += "defMax=" + Math.floor(ship.def + st.def / exp) + ", ";
    ret += "aaMax=" + Math.floor(ship.airDef + st.air_def / exp) + ", ";
    ret += "evaMax=" + ship.missMax + ", ";
    ret += "asMax=" + ship.antisubMax + ", ";
    ret += "recMax=" + ship.radarMax + ", ";

    ret = ret.slice(0, -1) + '\n    ';

    var cap = [ 0, 0, 0, 0 ];
    if (ship.capacityInit)
        for (var i = 0; i < ship.capacityInit.length; i++)
            cap[i] = ship.capacityInit[i];

    var eq = [ cannotEquip, cannotEquip, cannotEquip, cannotEquip ];
    for (var i = 0; i < ship.equipment.length; i++)
        eq[i] = equiptByCid[ship.equipment[i]].title.trim();
    for (var i = ship.equipment.length; i < ship.equipmentNum; i++)
        eq[i] = noEquipt;

    ret += "cap1=" + cap[0] + ", ";
    ret += "cap2=" + cap[1] + ", ";
    ret += "cap3=" + cap[2] + ", ";
    ret += "cap4=" + cap[3] + ", ";
    ret += "eq1='" + eq[0] + "', ";
    ret += "eq2='" + eq[1] + "', ";
    ret += "eq3='" + eq[2] + "', ";
    ret += "eq4='" + eq[3] + "', ";

    ret = ret.slice(0, -1) + '\n    ';

    ret += "sFuel=" + ship.maxOil + ", ";
    ret += "sAmmo=" + ship.maxAmmo + ", ";
    ret += "rFuel=" + ship.repairOilModulus + ", ";
    ret += "rSteel=" + ship.repairSteelModulus + ", ";
    ret += "sAtk=" + ship.strengthenSupplyExp.atk + ", ";
    ret += "sTpd=" + ship.strengthenSupplyExp.torpedo + ", ";
    ret += "sDef=" + ship.strengthenSupplyExp.def + ", ";
    ret += "sAa=" + ship.strengthenSupplyExp.air_def + ", ";
    ret += "dFuel=" + ship.dismantle['2'] + ", ";
    ret += "dAmmo=" + ship.dismantle['3'] + ", ";
    ret += "dSteel=" + ship.dismantle['4'] + ", ";
    ret += "dBaux=" + ship.dismantle['9'] + ", ";

    var mod = shipByIndex[parseInt(ship.shipIndex) + 1000];
    if (mod) {
        modRes = { '2':0, '3':0, '4':0, '9':0 };
        for (var res in ship.evoNeedResource)
            modRes[res] = ship.evoNeedResource[res];

        ret = ret.slice(0, -1) + '\n    '
        ret += "mod='" + getShipName(mod) + "', ";
        ret += "modLv=" + ship.evoLevel + ", ";
        ret += "coreType='" + modCore[ship.evoNeedItemCid.toString()] + "', ";
        ret += "coreNum=" + ship.evoNeedResource[ship.evoNeedItemCid] + ", ";
        ret += "mFuel=" + modRes['2'] + ", ";
        ret += "mAmmo=" + modRes['3'] + ", ";
        ret += "mSteel=" + modRes['4'] + ", ";
        ret += "mBaux=" + modRes['9'] + ", ";
    }

    return ret.slice(0, -2) + '\n}\n';
}

function formatDialogue(ship, title, str) {
    if (!str) return '';
    str = str.trim();
    if (str == '' || str == '0') return '';
    var ret = '';
    for (var i = 0; i < str.length; i++) {
        if (str[i] == "'") {
            ret += "\'";
        } else if (str[i] == '\n') {
            var ch = str[i - 1]
            if ('a' <= ch && ch <= 'z' || ch == ',' || ch == '.')
                ret += ' ';
        } else {
            ret += str[i];
        }
    }
    return "ships['" + ship + "']['" + title + "'] = '" + ret + "'\n'";
}

function getDialogue(ship) {
    var name = getShipName(ship);
    var t = dialogueTitle;
    var ret = formatDialogue(name, t[0], ship.getDialogue);
    if (ship.mainDialogue) {
        ret += formatDialogue(name, t[1] + '1', ship.mainDialogue[0]);
        ret += formatDialogue(name, t[1] + '2', ship.mainDialogue[1]);
        ret += formatDialogue(name, t[1] + '3', ship.mainDialogue[2]);
    }
    if (ship.mainDialogue && ship.mainDialogue[6] != ship.mainDialogue[0]) {
        ret += formatDialogue(name, t[2] + '1', ship.mainDialogue[6]);
        ret += formatDialogue(name, t[2] + '2', ship.mainDialogue[7]);
        ret += formatDialogue(name, t[2] + '3', ship.mainDialogue[8]);
    }
    ret += formatDialogue(name, t[3], ship.formationDialogue);
    ret += formatDialogue(name, t[4], ship.atkDialogue);
    ret += formatDialogue(name, t[5], ship.nightAtkDialogue);
    ret += formatDialogue(name, t[6], ship.breakDialogue);
    ret += formatDialogue(name, t[7], ship.vow);
    ret += formatDialogue(name, t[8], ship.desc);

    return ret;
}

function getEquiptAttr(e) {
    var ret = "equipts['" + e.title + "'] = { ";
    ret += 'index=' + parseInt(e.equipIndex) + ', rarity=' + e.star;
    if (e.hp != 0)            ret += ', hp=' + e.hp;
    if (e.atk != 0)           ret += ', atk=' + e.atk;
    if (e.def != 0)           ret += ', def=' + e.def;
    if (e.torpedo != 0)       ret += ', tpd=' + e.torpedo;
    if (e.antisub != 0)       ret += ', as=' + e.antisub;
    if (e.radar != 0)         ret += ', rec=' + e.radar;
    if (e.hit != 0)           ret += ', acc=' + e.hit;
    if (e.range != 0)         ret += ', range=' + e.range;
    if (e.miss != 0)          ret += ', eva=' + e.miss;
    if (e.luck != 0)          ret += ', luck=' + e.luck;
    if (e.aircraftAtk != 0)   ret += ', bomb=' + e.aircraftAtk;
    if (e.airDef != 0)        ret += ', aa=' + e.airDef;
    if (e.airDefCorrect != 0) ret += ', aac=' + parseFloat(e.airDefCorrect) * 100;
    if (e.aluminiumUse != 0)  ret += ', baux=' + e.aluminiumUse;
    return ret + ' }';
}

function merge(s1, s2, s3) {
    if (s1.startsWith('06FF91FF1B3516FF') || s1.startsWith('FF9186FF442424FF')) {
        var color = s1.startsWith('06FF91FF1B3516FF') ? '_G[_' : '_R[_';
        var content = s1.slice(16) + '/' + s2.slice(16) + '/' + s3.slice(16);
        if (s1.endsWith('%'))
            content = content.replace(/\%/g, '') + '%';
        if (s1.endsWith('点'))
            content = content.replace(/点/g, '') + '点';
        if (s1 == s2 && s1 == s3)
            content = s1.slice(16);
        return color + content + '_]_';
    }

    if (s1.length != s2.length || s1.length != s3.length)
        return null;

    var ret = '';
    var diff = false;
    for (var i = 0; i < s1.length; i++) {
        if (s1[i] == s2[i] && s1[i] == s3[i]) {
            ret += s1[i];
        } else if (diff) {
            return null;
        } else {
            ret += s1[i] + '/' + s2[i] + '/' + s3[i];
            diff = true;
        }
    }
    return ret;
}

function getSkillDesc(origSkills) {
    skills = [ null, null, null ];
    for (var i = 0; i < 3; i++) {
        var s = origSkills[i + 1].desc.trim();
        if (s.startsWith('^CFFFFFFFF003041FF'))
            s = s.slice(18).trim();
        s = s.replace(/FFFFFFFF003041FF/g, '');
        skills[i] = s.split('^C');
    }

    if (skills[0].length != skills[1].length || skills[0].length != skills[2].length)
        return null;

    var ret = '';
    for (var i = 0; i < skills[0].length; i++) {
        var t = merge(skills[0][i], skills[1][i], skills[2][i]);
        if (t == null) return null;
        ret += t;
    }
    return "skills['" + origSkills[0].title + "'] = '" + ret + "'";
}

function format(data, config) {
    remodelPostfix = config.remodelPostfix;
    cannotEquip = config.cannotEquip;
    noEquipt = config.noEquipt;
    countryName = config.countryName;
    dialogueTitle = config.dialogueTitle;
    modCore = config.modCore;
    rangeName = config.rangeName;

    var ret = 'local equipts = { }\nlocal ships = { }\nlocal skills = { }\n\n';

    var ships = [ ];
    for (var ship of data.shipCard)
        if (ship.npc == 0 && ship.shipIndex < 2000) {
            ships.push(ship);
            shipByIndex[parseInt(ship.shipIndex)] = ship;
        }

    var equipts = [ ];
    for (var equipt of data.shipEquipmnt)
        if (equipt.title && equipt.title != '喵') {
            equipts.push(equipt);
            equiptByCid[equipt.cid] = equipt;
        }

    for (var skill of data.shipSkil1) {
        if (!skillsByTypeId[skill.skillType])
            skillsByTypeId[skill.skillType] = [ ];
        skillsByTypeId[skill.skillType].push(skill);
    }

    var line = '-'.repeat(100) + '\n\n';

    ret += line;
    for (var equipt of equipts)
        ret += getEquiptAttr(equipt) + '\n';
    ret += '\n';

    ret += line;
    for (var ship of ships)
        ret += getShipAttr(ship) + '\n';

    ret += line;
    for (var ship of ships)
        ret += getDialogue(ship) + '\n';

    ret += line;
    for (var type in skillsByTypeId) {
        var skills = skillsByTypeId[type];
        var t = getSkillDesc(skills);
        if (t)
            ret += t + '\n';
        else
            ret += '-- Unable to format skill "' + skills[0].title + '" --\n';
    }
    ret += '\n';

    ret += line;
    ret += 'return { equipts=equipts, ships=ships, skills=skills }';
    return ret;
}
