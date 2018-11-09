-- MariaDB data manipulation script for the radio database
-- run this after structure definition
-- best import using MariaDB client command "source <path to this file>"

SET CHARACTER SET utf8;
USE radio;
DELETE FROM BaseEntity;

INSERT INTO BaseEntity VALUES (0, "Document", 1, UNIX_TIMESTAMP()*1000);
SET @id = LAST_INSERT_ID();
INSERT INTO Document VALUES (@id, x'8600f8cf1a2733e9d12ee95f38afdca9ded9eb77ba4168e1ae7ff6a36640d3b0', "image/jpeg", x'ffd8ffe000104a46494600010101004800480000ffdb0043000302020302020303030304030304050805050404050a070706080c0a0c0c0b0a0b0b0d0e12100d0e110e0b0b1016101113141515150c0f171816141812141514ffdb00430103040405040509050509140d0b0d1414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414ffc2001108012c012c03011100021101031101ffc4001b00010101010101010100000000000000000001020405030608ffc400160101010100000000000000000000000000000102ffda000c03010002100310000001fe81d669a294a68a5294a509549548502042c42c2108432421921014a52a69aa94d14a54ab4141500020045885891619219210864868a68a534957454a55a54142d2148020108b1205864864864864868a68a68d255a68a54a1680500004008908b08916265724324214d14d1a4a68aba0528294000021480812108b13245c9921921a29a4d1a5b56349568294028060a68020202112108b948b932648ba4a68d1ab2cba2a55a0a0a0e2ae14e7a03675cbe89f48101080ca42195c90c993468d255d1a4a55a50500f1ace6a0000347af2f4c010840992195864c993468d26969a294a5001e559c54000001a3dc97e9004064890864cae4c9a346934b4d141a00a9f3b7f3f650000000774beac44288421121932657268d26975659740a500a9e7d7994000000068fd166c2004210ca432b9214d1a345294a02529e3d71d000000003f419bf448b01010ca43264cae934ba294d14299ab5078b5cb400000000f7b37ec822c04210ca43266db1b29a294a0a5403c7ae3a000000007e8337e8822c042108992195a68d255a5284d0017ccaf3ac000000007e9334804580c83290cae529a5d1a06803480178ebc7b00000000e88f7250411602108653242ae92ae8a5052a02887e73500000000f4a5f4a010172084211326569a4aba29414a80a078d67250000000f7f37ea0202e410192265725349a5a5282950140e5af16c000000e997db80080b900c9089932b4d255d14a0a54050078367c6800001eccbd70010172084065324b51a4aba06814a80a00e4af1ac00003ef1eeca00202e410842264ca934ba340d02a5014003f3da9800007ab2f7c000822c04210ca432d19d2e8a68141a400a00fceea640001ea4be84004022c04211326481745345294255a80a21e4571d800006cf625e9804022c06419486572134ba4d2d29415290e5ae45e2b200000003a23b0eb3eb1160210844cae4843468d14a5315c29cc73d5000000000001b3a23b17ae2108652195c834534696a73d79164000000000000000074c7af2c226486572134b4d1a4d2f8767ce800000000000000001eacbd5264865729951a345340f0752800000000000000000ee97d08ca43265720d1a29a31678b5400000000000000000764be8c9922e532b921a3468d18af1ec000000000000000000eb97d048665c90c90d1a34548bc7428050000000000010021f63a22264c995843453468a9a5a5ab14a002805040085a912844cc4b6444cae4c90cd229a29a3454a696a0ab41414000801011210842195c90ca65610d14d14d1a2a55a52a0a550000008820b7322a4b92265619219210d14a68a68a52a52ad414140a40801162161132458917291724210a534529a294a52a55a8280148008b02458421921172908432a4a5345294d2934505282d243464a008095222c48421922c484329fffc400251000010303040203010100000000000000020001030414401112133031332021227050ffda0008010100010502fe9fe16f15b99ffc292a84514f21ad168cb46424e282a89904832366cd3bcbd0cee2f0cdcad975526e7e9677178cf9032643e38fae94f43c9ac7faeb17da59357eeec8df58f22abdfd90fa722afddd91b691e45637df5f95e326a87587ae01dd364bb6e6f1d746397543b65ea8838e3caa90df174c01c92e64b1f1c9d14c1b23cca98f7c7f3863e493388769fca8dbf19c45bcfe5485f9cc77dad3d47237cc49c0a29c64c97fa455518a2ac2744ee6fd4139821ac643281e19c831b156279e425a6b82244286a8d90548977cf3710f97c6866e3ee90b7c9914e5ac7d7ae8c3e32295fefacfd6de3229bd9d727af269bd9d64da8db3ab6756a4ad495a92b5256a4ad095a12b425684ad095a12b425684ad095a12b4256a4ad495a92b5256a4ad495b3a8a278cbfb57ffc400141101000000000000000000000000000000a0ffda0008010301013f01349fffc400141101000000000000000000000000000000a0ffda0008010201013f01349fffc4002b100001020404050403010000000000000001000211303240213151711222416181205070911372b1a1ffda0008010100063f02f942a1f6b31f7ec506f39ff1550ecd5aac964b95c42e61c4a2d37d01833fb222302b475e7e3190ce5446683ae9ced2670eb74c6f78cc074ba1d9b35bb5c9d84d66d73e26b76b961f1ecdb6331bf77446aa12dcef1771e8ec65b45df718ca1a0c4de91d331263d5d7b1ead90074eb7ee6e87d6e3adfb9da9f596f9bd89c02e1653d4eb222335a3b4b9c70dd55c5faae5686eea2e3c5bcbce2342b99a42c1c2ce2e305cadf2e55c3f5c1638ef63838858c1cb1e53de7eae39289313adbc0d3fc9ce3e05cc34986e9d31db5d1da63b6ba3b4c2355505505505505505505505505505505505985505505985505505505505505505505505505505188f9afffc4002910000201030303050003010100000000000001111020312130f041516140718191a1b1c1d1e1f1ffda0008010100013f21b629041148208208a4104520820820820820822916733581220812208229045229045208208208208a4114822b0411c8b9220820820822c820820822c822ac8208a45a90a8909104562b1641041164562904558d5799155114820823d0c59045228c6730242121212aa548b62afbb4f720ff0030b09fec22b1b914744844096c455ab474f4c3e4c847ec0d5e7eda9e27d1e27d1f862cd1509dd68cd403baeaab1645228e8e9ccd1085456c55b4936dc25ab64acffbff00c8b4bd65b061a1103d0caefed7c58e8c8f1f82108545b1ff0054afb6d2cb2130c4a0d272bb3b1d8c6318e884210b61599868bcf414c6ae5e5beef6e65b18fbedb19cc885b7efc93e373cb29bdd58e913ff008210b69a51c2771e090f74b5d5d8c4210bd30bf0f698ce645442158ac4847dd77607d96e76319cc0857ab3ee3b88c3be835876d3618c7bf34fbd6e227d1397c6db19cc8842158ad5bdc2410d9b6568f6ff00837f76babb19cc510ad577861f6ebb7de5cbf77b0ec631510ac574a35ae8bfbda8c34067719cc8842158afef4be8d9d55dcf8e9bace604210ac57e90ef2f6ebb124f97b369d8c7f02a2158b63cdc2be1ea5a3e369dbcc8b7e0bc39af6be6eb93bcec7463398108555556a9ac48cb7825a64f973e0bc6c203e10d17e67f5b6c63a21510ae64b2c93bb418293b249f719adfd12e6ff8f8dac9a3af9c8cfd8ad5198de261d1d5d8c6732215a88115e9dd8e7ccf8334c9e01c93a9df57a06a73a9f8b6ce863ca81bc4bea7dd58c6319cc0842a2a4142e88ff9636def3fabd3b5d6a76ff4b58c6210ab93b7b3f02f53afbae3e2aebcc8856390eca4c3edea74bf09d1d9cc08421087fb660f552e8c6318a8abfac2c2f53fa231b18c6ce64421310883b29028ff00d4e6b382ce0b392ce4b392ce0b38ace2b38ace3b38ace2b38ece2b38ace2b392ce4b392ce4b382ce0b39ac6867691a51b1b1b19cc550ad9d8926b24ec3757574fa26c564d66b3b124d26c91b268d8c6c6ce668a9359249a49359d89269364923759a49cc5156444d24924926924df349249269248dd1bacdb3444d2491524924924924924926936c8c9a3746e93c93a8aa8ff288e945a935e875a4e94926feb4e95e96751b83ffda000c03010002000300000010f9bfd2fb25f74df7bbed36df4ff6d3fd6cf6f9759ffdfef74d3eff006ff6dfefa6f379e59edfbfbf4bbcfbfdeffbf926f3fdb6dbf93fb7cdf5dbefe7ff005fbedb6db7df7dbc9f5f3e9e6d4ed3fdbedb6fb7df7ffebaff00a5be3d7efbef964938b7dfebf7ba5d27bbff00befaf6db6d31b6ff007fe5bff9ac9f6dfdedb6db69b9b6ff00e9efb66bb7dbec5b6db6db53fdff00fbff00fdf9eff7f736db6db6db9e6df5fecb669f6ffefdb6db6db6e6b3edf7fb6d7edaf9bf6db6db6db9b7dbfbbf3bcdb7936ddb6db6db6a6fe7ff00fd3e9fff00e6db56db6db6dbdb6fbeff00fbf4fbf9b6edb6db6db7f4dfcff7fa6f36f26d376db6db6d8db6bbff003792edbcdb6ffb6db6db5b6dacfbcf7fdb6f66dbe6db6db6afdb6b37f37dfedbd9b6ff00f6db6db7b6dadff4d84fbef26d3fcdb6db5fedb6bbff003efecfbcdb4ffe6db6ddfb6deeff007dafb77fe6db7fdb6db6fedb7fb7dfedadfb7d369b96db6d27b6daefbefafdb6df4fdd6db6db6dfcff00dffdfcbeebff004fb6db6db6db6d2796daed24ba4e9b6db6db6db6db6db7ff00fb49ad9bf6db6db6db6db6db6db5f6db6975cdb6db6db6db6db6db6e5db59b59db6db6db6db6db6db6da9f6dafff0064db6db6db6db6db6db6ea775ff6bf18480002010080010085a7f26f75db8bbfff00fdbfdf2e03e67ff71f7fafd3ff00f7db6dfefa7ffef77f3efbdd35f3fdadff00e977c72b3ef3dfb7de7bff009ffdb2dfef76dfcdf79b7fbfd7ff007cfa6d3edacf26f65b77bfedbeb35f3c3af924905b26b66dbfffc4001c1100030003010101000000000000000000000111102031213040ffda0008010301013f1048ee50bd18c831886584214a3f04a09145e8dcc250e96120b3d13baf73dc7462744217833a34528d1354e091c29c11d1f83596aeefc1798b8426254832e610835484d21c11d38704a639bd129894944c4228d0d907f283c3670824744a89d1287316e1ab9a3770ddc74a253eefd1acf47e8953a2f4e668d521cc43a250e9d129f8a5266e3a27499a52c18dd1283f93d6fc1e2cc745e8943b8a747e10487e937bf2bbbf33d29ccd20d421d3bb70e8d4f9b54bb482587e90b48521063576e0952fd10d5179accb504a9dc5241282704a6b6106efdb8274e6acb31d3852146e1dd5f82546efdde3a7374e0962c1211354a8ff0003c51aa5ba312b98744a0f56706f09524fabd39b2ca192ed26641fe17e96e930968b4b045c4c4fa2c3ca745a4b8794c5a33995f65899425346278a2d98fccccc9f810f478594b564d9fc96c87a3293299268c9bcf8a53643d1e252085ab1657d26e86ae8f0bcc2f0e0b465cafa2dd09dd25d2518b5449f65a5d129a3d2d18f56a132b37e7ccf47ac8345a41fa2f04a96e8d5c359bf44f4484ee966133851147e0bf55ba770fd3a43a706a8ff005acb624254e146e90a704f17f4da3770d0d5267a731d17ea4745e946a1d2090d9c3a3f47efea42f4944e89c25261320c4e8dfea588224265b243a5a3f0842108421084210842108421084210841b994ca51313a7068ee9d2fe16e0c82f4870487ee970b0941aa745e8bc3b8b8efd1973289130b1c1226b21c1a20d9c2c2625c274a5d194a2f058452419336131dda9c128704845a5c41b24251fa2f30961a986363544e8dd1a10d4209613bf198686417a705e8b0951f84c35309c3a708708274e8878477e8b0f0b0c5a310c621887842c31edffc4001c1100030003010101000000000000000000000111304050317020ffda0008010201013f10fb9c27e66fcc2d4dc5d17b4b8cb8cb8cbce32e32c8fce33db5c6589f9bab0dbbab03738cfde33de985a9b50992226ac269444271e665b2f8cf8cf8cf2d294a5294a5294a5294a5294a5294a52dfb5fffc4002910000201020406030101010100000000000001f011213141617110518191a1d1c1e1f1b1302040ffda0008010100013f1048484bbc9a0968242ee93412d0546a2e89361049fdb155bc9a1e077156d26c60453bee6c93b1b0d9d46a48b83721e872741a0c3a3093c0c3fd0e2443ec1f60d579c9d0740d0d51d64fe0d7e175836b6a051894910aa280a24424e9b1f60ba24d85c980ba84af27a10429d24d8412d04db49b156853f48928740f46e7649b0c3e61f249e061aec3e493c0c35dc7dca4e430d6234fac9a0c3cc5d855ed50949109090949109763982aa4fa17e282e6fe8aad24d85452877099c9f45294299946df293622c5999d5274317c1986d27e0d65428524887a07d8355de4d0684e7dc71221d830d7ec8861a1a9221a4b1a75a8950fd04bab49d84adf0730ee49a0b250b04bbc9a097e082524452df42124b0ab4c048892842335cd127828ca14ade4fe108a31aae12781d435d87c92781fe06bb0d49109c06afac9a0d1d5f4442504a4884bb082ba4f425851585f6628910b910a812ac9f452825fa52488ec76249629a7829a147ca4ec534f1c24962898d5b99e3fb3f830d731ae52781afc18776b26835f83b18d4910825aa5346fb8ee49a096a6454b9dc934323212fd129223b025c92ee28910961c8492f66127d14ad28b829493e8cc749574bcde9e7e46f51a5f2fbbf0a75f70487e2a364aad5b9b24962951ec2f27e1679742941aae926c3541a1aaef2683551a1abc9e86bb0f12fe8d49108ab827dc48a025749361519559604ab27d097612af2a097293c14e676ee24e4fc1245c126dd93726c528c5d5d1dae6d95474eb3f269eaf1633aab6e6edbc891827a07f4019d596bd3b60325827469fc3f039a14625b717cf63393d0d54624961aaa1aa0eade4d0771e2e6357e4e4d04d06bb092443451ac1b5b51fa242491096f81057b49fc13b096c2524424beb82891709510814a874492c5be545d8a89c0dadbbcb4679f2112249249592597fdb12df6287e5a4ece09cfd0763393d0d54686a4886a8c61aaef2683b8d6624910d4a096f91b3789f709593e84133124884b0cc4a09491095be0c44a927d70a124b0f6be949bade5b559be6e9fe55075a8231c8e418a990c718d4910943b0d51c9e86b612d513393f82504c849221d33a75a894104f127213e84a2fb12a49f42e09524fae180af27d0d424d5d99b593bd2c2a62b6daccbb7dff00ceb5add534fb4346327d0d118d49114aaa0d0d5ed2781f81a13bc9a0834d73e88bf4411c9f82d84bb0955c9e84b43b096727f38e327d095283e973b692de5f8ff46a27469ec63a375583bada761a3999c9e8c5507d0c1ac9a0d0d09de4d04cc68dcf212b27d094e04a488564254425793d1d046327d0ac50d3a17767f1fe89564549bbfe2e0d4910c953049e8a6c354d849221db61a1f993411572eef8104bd24fe098095cc24fa17092584a9c3c49b111affacf6a63a49b0c6a952496e0f1635593e86abe86b1124884bd2855ac1be94702c7693916210e6c1c9a0b12a29250bb2b70c74936303503766d7fa3744cad767fc15f9e83e0d577934e12a4494174d869d58d5f949b095b18078d97f425e4f45c842524452d90b3fe99f29362a250c74936188a34d8a7becfdffa56c971749d6c2192ac093a5a2e18e926c31aa54925b8354ae026127c1830e078b93e069674ead8848577b49c8590efcb7149282123c49b0c48c769342d1df6c583f0ff00d2b42ab1b095f47375be6cc749361f06a4887c1e327a1dd0d599749f5c0935836b644258c5b49cb83e1cc925b82317293630e18e926dc31408f5d552a5e8a7badcd3a7f9e3cb25fdbe063cd49b0edc31d24d8c1c3393d71492c3c2820f1766fb85949f07c04d4524a0b15c249622c231d24db8f793a15555441344b7c1f5ff0026e89b18d6caadee3f85a538e3a49b0c66727a2860249618f3fe89693d0947827bd4c9e844494e058fd99c9eb845cc74936e181dd49b70a54aba59b593aafe09a693574ffc6fb1db960baba0db6abbb722e18ed2683e124b152547849e85d3618d5f95e4c8c03b3c5f4a3f4c86293d71162a4f8e3d926c3e18e926dc53a3d9e73f0a50bfb2cba3b7f8d39347a75cb23fae9af0eea4d87b70c749361f0cf949b0ec8988ece4f4377307c8eb5c1bdaa1ab27d0dfcc0b331a4884e9cb8492dc08c74936e3dd49b70a92eb52962f23e774269aaa754ffeef629beb932dde1d46eadba25a2c11dd49b70c3331d24d863b2c7b924b70c06127d0fa0feea44941957e553009ae7d469223115d84e48b858cc7493618ac63a49b714e8f0b56ea4429460b76ad5787ff00697f81e92aff0059de4e9c71e6a4d87c1bb49eb8b491190f07fd1baa727c0f21e2e8ff008335c524a09e0274789849f42baf0262c64f456dc31d24d8af0eea4d8dda4962de097a179a3ae85e157aff00dad9bc39734d51be8d71c769341be18e926c62199c9e86eac6b0eca4f4645c157c9bee1aea4f818615e4fa15d64351924b15e0c7493618ac63a49b098ed56e893919686b04f2326cde2f612a7fde5ccadaaa7a359a13a76b3df8eecd791abd1d5524e437c31d24d876e0dde4f5c31e4392506a58630393e06d277a75a8d61af5a8b96726837060e4f42755fc1313a3e526c5463e4504eecb731398f3c3cd8b220e7f896eec5046baa6d6d9817f934b15c5e904609a3a3c516b631b32ceee02710d349551654724a706b0e49418f16c6eee4e430ddf17d281974637893909e0c5616327a1619761a962b54303c4e4962ded80c294d7369d92fdd95f5c948f2c7c8bbc7396de456dbfdd384b723b3e369d9d865e58775e84c5b56589fa3e47655c9ac79ce6492c720d6f91a4886335c75e55ee1a96ce4d061bb09c910c262292a958654c74172e863406c7d9725a2ffcece9bddffa7a15544d34d3566b0a643741ddc9e86c61afb49c8a1bbd3ad461bb31abd24e4262b0ae496359321f5faad9e0ad5b7757ff00a5d58abbd7cd75f23f3268375541a837793d0d8dbadabd28fd18692213b0bc09e527f0d6d7b154c4f347deff00fa68655f589fd8dd06b0dc910d8dd06ef64df70d7959fc186a0d793d0d90e4fadfe172a59b2bff004bd9e6dfd43761bce4fe0d4fc1869221af93dea309ea349109e5d84c7ae4fae6c78cbff4ca73435f949b1606a5ddc692228156b37d28fd1bb0d5dd49cb80daf51bba9390e7a4995ae1742a8afa5cbd04ff00917a099e8f424fa153e5fa137d09be845f424fa107d093e84bf424fa127d097e841f424fa127d09be84df41ae2fe107d06a8bf87e07a1ede9e829f2dd52bad6dcd0df63b07724d0c81ada14ae29b7d4272442630d244276fa1313aef268275104e8e4f4269afa13a09c911d8c33f255a93e8c0505549f854a071222b5cfa23b1849f437cae3cc6ef693c0dd31b96341bac9f437d86b683757ac9a0d8d41bbc9e874cfbaa2a04c4fbc9a09d3d0d6d04e4884c4f9bea289115ec2b8b9a4f0275426c51222aa22bb6e492c4a509524962ab41a156569362a3448ab727d0df21ba0eebc9e380ecd06efac9a70188488a055e55e947e898d7d64d04c41392213105122176098ba1c9a0a8d50989b93f054098f1e526c54aebd6a55c9f854ad332893f0747e0df363ee9341ba95a0dded2781a2d47cd89dc9341b1b1dd27a1bfc1f615ae4fc858c9e861313beb26820c2ee93413105d0e4d0560a2a289109dacc865da49b15d8aea26f9b93a1d4ae37ee37593e87c9da837d07122187dc3e693c0d8f907749e8e40dd084886fe86f1bd871221b59b4b76c4c4c4e488413fd1ba49b0827fa28910ba90d5cc4fbc9a0a8d51cde4dd276105fa224a1414d08929c1b86d7393b0e8c28546fa49b0df51ba663d52761bf0694d06e488d01bec42443654b06d6d41996ad762e4ba7913b3dabe4ce9ab2e696de44fe5e458b5955a1aad2dbc95a55a569d4c1f56bc0d52af34bb95255d2be4c1b5abf026eab75e44ee7c957c9851ab5d915754ab8d3c8a8ab4f92b46f768a9b5baf2554ae95f256f4d598b5d3c8dd13dabe46eadad5a1bc3a791bb574af91bb96ac6f05b791bc5a7c8f3dda316ba791bc5a57c8f17bb43c574f2376e95f23c4b2ab5e07b2b2764ee8fffd9');

INSERT INTO BaseEntity VALUES (0, "Person", 1, UNIX_TIMESTAMP()*1000);
SET @id = LAST_INSERT_ID();
INSERT INTO Person VALUES (@id, 1, "guest@htw-radio.de", UNHEX(SHA2("guest",256)), "USER", "Radio", "Guest");

INSERT INTO BaseEntity VALUES (0, "Person", 1, UNIX_TIMESTAMP()*1000);
SET @id = LAST_INSERT_ID();
INSERT INTO Person VALUES (@id, 1, "ines.bergmann@web.de", UNHEX(SHA2("ines",256)), "ADMIN", "Bergmann", "Ines");

INSERT INTO BaseEntity VALUES (0, "Person", 1, UNIX_TIMESTAMP()*1000);
SET @id = LAST_INSERT_ID();
INSERT INTO Person VALUES (@id, 1, "sascha.baumeister@gmail.com", UNHEX(SHA2("sascha",256)), "ADMIN", "Baumeister", "Sascha");

INSERT INTO BaseEntity VALUES (0, "Album", 1, UNIX_TIMESTAMP()*1000);
SET @id = LAST_INSERT_ID();
INSERT INTO Album VALUES (@id, 1, "Winter", 1992, 11);

INSERT INTO BaseEntity VALUES (0, "Album", 1, UNIX_TIMESTAMP()*1000);
SET @id = LAST_INSERT_ID();
INSERT INTO Album VALUES (@id, 1, "Autumn", 2012, 20);

INSERT INTO BaseEntity VALUES (0, "Album", 1, UNIX_TIMESTAMP()*1000);
SET @id = LAST_INSERT_ID();
INSERT INTO Album VALUES (@id, 1, "I am Ok", 2008, 14);


SELECT identity, discriminator, email, HEX(contentHash) from JoinedEntity;
