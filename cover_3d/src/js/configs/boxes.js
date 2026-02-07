/**
 * Video games boxes dimension in centimeters
 */

// 
export const BOX_SCALE_FACTOR = 0.15;

export const BOXES = {
    '3do': {
        name: '3DO',
        config: {
            width: 14.5,
            height: 27.5,
            depth: 2.5
        }
    },
    '3do_eu': {
        name: '3DO (EU)',
        config: {
            width: 14.2,
            height: 12.5,
            depth: 1
        }
    },
    'amstradcpc': {
        name: 'Amstrad CPC',
        config: {
            width: 7,
            height: 11,
            depth: 1.5
        }
    },
    'atari2600': {
        name: 'Atari 2600',
        config: {
            width: 14,
            height: 19.1,
            depth: 2.5
        }
    },
    'atari5200': {
        name: 'Atari 5200',
        config: {
            width: 17.5,
            height: 22.5,
            depth: 3
        }
    },
    'atari7800': {
        name: 'Atari 7800',
        config: {
            width: 14,
            height: 19.1,
            depth: 2.5
        }
    },
    'jaguar': {
        name: 'Atari Jaguar',
        config: {
            width: 14,
            height: 19.1,
            depth: 2.5
        }
    },
    'jaguarcd': {
        name: 'Atari Jaguar CD',
        config: {
            width: 14.8,
            height: 21,
            depth: 2.5
        }
    },
    'lynx': {
        name: 'Atari Lynx',
        config: {
            width: 13.5,
            height: 16,
            depth: 2.5
        }
    },
    'atarist': {
        name: 'Atari ST',
        config: {
            width: 20,
            height: 25,
            depth: 4
        }
    },
    'colecovision': {
        name: 'ColecoVision',
        config: {
            width: 14,
            height: 19.1,
            depth: 2.7
        }
    },
    'channelf': {
        name: 'Fairchild Channel F',
        config: {
            width: 14,
            height: 19,
            depth: 3
        }
    },
    'odyssey2': {
        name: 'Magnavox Odyssey 2',
        config: {
            width: 12.4,
            height: 16.5,
            depth: 2.9
        }
    },
    'intellivision': {
        name: 'Mattel Intellivision',
        config: {
            width: 14,
            height: 19.1,
            depth: 2.7
        }
    },
    'msx1': {
        name: 'Microsoft MSX (Konami)',
        config: {
            width: 7,
            height: 11,
            depth: 1.7
        }
    },
    'msx2': {
        name: 'Microsoft MSX2',
        config: {
            width: 14,
            height: 19,
            depth: 3
        }
    },
    'xbox': {
        name: 'Microsoft Xbox',
        config: {
            width: 13.5,
            height: 19,
            depth: 1.5
        }
    },
    'xbox360': {
        name: 'Microsoft Xbox 360',
        config: {
            width: 13.5,
            height: 19,
            depth: 1.5
        }
    },
    'xboxone': {
        name: 'Microsoft Xbox One',
        config: {
            width: 13.5,
            height: 17.1,
            depth: 1.2
        }
    },
    'pcengine': {
        name: 'NEC PC Engine',
        config: {
            width: 14.2,
            height: 12.5,
            depth: 1
        }
    },
    'pcenginecd': {
        name: 'NEC PC Engine-CD',
        config: {
            width: 14.2,
            height: 12.5,
            depth: 1
        }
    },
    'supergrafx': {
        name: 'NEC PC Engine SuperGrafx',
        config: {
            width: 14.2,
            height: 12.5,
            depth: 1
        }
    },
    'turbografx': {
        name: 'NEC TurboGrafx-16',
        config: {
            width: 15,
            height: 21.5,
            depth: 2.5
        }
    },
    '3ds': {
        name: 'Nintendo 3DS',
        config: {
            width: 13.5,
            height: 12.5,
            depth: 1.3
        }
    },
    '3ds_eu': {
        name: 'Nintendo 3DS (EU)',
        config: {
            width: 13.5,
            height: 12.5,
            depth: 2
        }
    },
    'n64': {
        name: 'Nintendo 64',
        config: {
            width: 17.8,
            height: 12.7,
            depth: 3.2
        }
    },
    'n64_jp': {
        name: 'Nintendo 64 (JP)',
        config: {
            width: 14.5,
            height: 19,
            depth: 2.5
        }
    },
    'nds': {
        name: 'Nintendo DS',
        config: {
            width: 13.5,
            height: 12.5,
            depth: 2
        }
    },
    'nes': {
        name: 'Nintendo Entertainment System',
        config: {
            width: 12.8,
            height: 17.9,
            depth: 2.5
        }
    },
    'nes_jp': {
        name: 'Nintendo Famicom',
        config: {
            width: 13.5,
            height: 9.4,
            depth: 2.5
        }
    },
    'nfds': {
        name: 'Nintendo Famicom Disk System',
        config: {
            width: 7.6,
            height: 10,
            depth: 1.3
        }
    },
    'gb': {
        name: 'Nintendo Game Boy',
        config: {
            width: 12.5,
            height: 12.5,
            depth: 2.5
        }
    },
    'gb_jp': {
        name: 'Nintendo Game Boy (JP)',
        config: {
            width: 8.8,
            height: 10.1,
            depth: 2
        }
    },
    'gba': {
        name: 'Nintendo Game Boy Advance',
        config: {
            width: 12.5,
            height: 12.5,
            depth: 2.5
        }
    },
    'gba_jp': {
        name: 'Nintendo Game Boy Advance (JP)',
        config: {
            width: 14.4,
            height: 8.8,
            depth: 2
        }
    },
    'gbc': {
        name: 'Nintendo Game Boy Color',
        config: {
            width: 12.5,
            height: 12.5,
            depth: 2.5
        }
    },
    'gamecube': {
        name: 'Nintendo GameCube',
        config: {
            width: 13.5,
            height: 19,
            depth: 1.5
        }
    },
    'gamecube_jp': {
        name: 'Nintendo GameCube (JP)',
        config: {
            width: 10.5,
            height: 15,
            depth: 1.5
        }
    },
    'switch': {
        name: 'Nintendo Switch',
        config: {
            width: 10.5,
            height: 17,
            depth: 1
        }
    },
    'vb': {
        name: 'Nintendo Virtual Boy',
        config: {
            width: 12.8,
            height: 17.9,
            depth: 3.2
        }
    },
    'wii': {
        name: 'Nintendo Wii',
        config: {
            width: 13.5,
            height: 19,
            depth: 1.5
        }
    },
    'wiiu': {
        name: 'Nintendo Wii U',
        config: {
            width: 13.5,
            height: 19,
            depth: 1.5
        }
    },
    'videopacplus': {
        name: 'Philips CD-i',
        config: {
            width: 14.2,
            height: 12.5,
            depth: 1
        }
    },
    'neogeo_aes': {
        name: 'SNK Neo Geo (AES)',
        config: {
            width: 17.1,
            height: 22.2,
            depth: 3.8
        }
    },
    'neogeocd': {
        name: 'SNK Neo Geo CD',
        config: {
            width: 14.2,
            height: 12.5,
            depth: 1
        }
    },
    'neogeo_mvs': {
        name: 'SNK Neo Geo (MVS)',
        config: {
            width: 24,
            height: 17,
            depth: 5
        }
    },
    'ngp': {
        name: 'SNK Neo Geo Pocket',
        config: {
            width: 9,
            height: 13,
            depth: 2.5
        }
    },
    'ngpc': {
        name: 'SNK Neo Geo Pocket Color',
        config: {
            width: 9,
            height: 13,
            depth: 2.5
        }
    },
    'sega32x': {
        name: 'Sega 32X',
        config: {
            width: 13,
            height: 18,
            depth: 2.5
        }
    },
    'segacd': {
        name: 'Sega CD',
        config: {
            width: 14.8,
            height: 21,
            depth: 2.4
        }
    },
    'segacd_eu': {
        name: 'Sega CD (Mega CD) (EU)',
        config: {
            width: 14.2,
            height: 12.5,
            depth: 2.4
        }
    },
    'segacd_jp': {
        name: 'Sega CD (Mega CD) (JP)',
        config: {
            width: 14.2,
            height: 12.5,
            depth: 1
        }
    },
    'dreamcast': {
        name: 'Sega Dreamcast',
        config: {
            width: 14.2,
            height: 12.5,
            depth: 1
        }
    },
    'dreamcast_eu': {
        name: 'Sega Dreamcast (EU)',
        config: {
            width: 14.2,
            height: 12.5,
            depth: 2.4
        }
    },
    'gg': {
        name: 'Sega Game Gear',
        config: {
            width: 12.5,
            height: 17.5,
            depth: 2.5
        }
    },
    'megadrive': {
        name: 'Sega Genesis',
        config: {
            width: 13,
            height: 18,
            depth: 2.5
        }
    },
    'mastersystem_jp': {
        name: 'Sega Mark III',
        config: {
            width: 13.5,
            height: 19.5,
            depth: 2.5
        }
    },
    'mastersystem': {
        name: 'Sega Master System',
        config: {
            width: 13,
            height: 18,
            depth: 2.5
        }
    },
    'sg1000': {
        name: 'Sega SG-1000',
        config: {
            width: 13.5,
            height: 19.5,
            depth: 2.5
        }
    },
    'saturn': {
        name: 'Sega Saturn',
        config: {
            width: 14.8,
            height: 21,
            depth: 2.4
        }
    },
    'saturn_eu': {
        name: 'Sega Saturn (EU)',
        config: {
            width: 15,
            height: 21,
            depth: 2
        }
    },
    'saturn_jp': {
        name: 'Sega Saturn (JP)',
        config: {
            width: 14.2,
            height: 12.5,
            depth: 1
        }
    },
    'psp': {
        name: 'Sony PSP',
        config: {
            width: 10.5,
            height: 17.6,
            depth: 1.4
        }
    },
    'psx': {
        name: 'Sony Playstation',
        config: {
            width: 14.2,
            height: 12.5,
            depth: 1
        }
    },
    'psx_eu': {
        name: 'Sony Playstation (EU)',
        config: {
            width: 14.2,
            height: 12.5,
            depth: 2.4
        }
    },
    'ps2': {
        name: 'Sony Playstation 2',
        config: {
            width: 13.5,
            height: 19,
            depth: 1.5
        }
    },
    'ps3': {
        name: 'Sony Playstation 3',
        config: {
            width: 13.5,
            height: 17.1,
            depth: 1.4
        }
    },
    'ps4': {
        name: 'Sony Playstation 4',
        config: {
            width: 13.5,
            height: 17.1,
            depth: 1.4
        }
    },
    'psvita': {
        name: 'Sony Playstation Vita',
        config: {
            width: 10.5,
            height: 13.5,
            depth: 1.3
        }
    },
    'snes_jp': {
        name: 'Super Famicom',
        config: {
            width: 10.7,
            height: 19,
            depth: 3.1
        }
    },
    'snes': {
        name: 'Super Nintendo',
        config: {
            width: 17.8,
            height: 12.7,
            depth: 3.2
        }
    },
    'snes_eu': {
        name: 'Super Nintendo (EU)',
        config: {
            width: 19,
            height: 10.7,
            depth: 3.1
        }
    },
    'wswan': {
        name: 'WonderSwan',
        config: {
            width: 8.8,
            height: 12.8,
            depth: 2.5
        }
    },
    'wswanc': {
        name: 'WonderSwan Color',
        config: {
            width: 8.8,
            height: 12.8,
            depth: 2.5
        }
    }
};