-- =====================================================================
-- Agent Locally · Ampliación de cartas (82 platos más, ~13 por restaurante)
-- Ejecutar DESPUÉS de seed.sql. NO borra nada: solo añade los platos que
-- falten, así que se puede ejecutar varias veces sin duplicar.
-- Después: npm run embeddings -- --todos   (recalcula la búsqueda semántica)
--
-- Casos de prueba que añade:
--  · Ingredientes ocultos: gelatina (panna cotta), bonito en el dashi (sopa de
--    miso), surimi (crustáceo), crema de anacardos (lasaña vegana), mole con
--    cacahuete y almendra, romesco, korma con almendra, cerveza en rebozados.
--  · Adaptables: pizza diavola sin salami, pad thai sin cacahuete, romesco
--    aparte, biryani sin anacardos, entrecot muy hecho…
--  · Embarazo: carpaccio, tataki, sashimi, queso de cabra de leche cruda,
--    mousse con huevo crudo, huevo escalfado.
-- =====================================================================


-- Restaurante 01
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000001', 'Burrata con tomate y albahaca', 'Entrante', 'Burrata cremosa con tomate de temporada.', 12, ARRAY['burrata pasteurizada','tomate','albahaca','aceite de oliva'], ARRAY['lacteos'], false, 'Burrata elaborada con leche pasteurizada.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000001' and nombre = 'Burrata con tomate y albahaca');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000001', 'Carpaccio de ternera', 'Entrante', 'Láminas finas de solomillo con rúcula y parmesano.', 13, ARRAY['solomillo de ternera crudo','rúcula','parmesano','alcaparras','aceite de oliva'], ARRAY['lacteos'], true, 'El parmesano se añade al final; se puede omitir.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000001' and nombre = 'Carpaccio de ternera');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000001', 'Bruschetta de tomate', 'Entrante', 'Pan tostado con tomate, ajo y albahaca.', 7, ARRAY['pan de trigo','tomate','ajo','albahaca','aceite de oliva'], ARRAY['gluten'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000001' and nombre = 'Bruschetta de tomate');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000001', 'Pizza diavola', 'Principal', 'Tomate, mozzarella y salami picante.', 13, ARRAY['masa de trigo','tomate','mozzarella pasteurizada','salami picante','guindilla'], ARRAY['gluten','lacteos'], true, 'El salami va por encima; se puede pedir sin salami.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000001' and nombre = 'Pizza diavola');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000001', 'Pizza cuatro quesos', 'Principal', 'Mozzarella, gorgonzola, parmesano y queso de cabra.', 14, ARRAY['masa de trigo','mozzarella pasteurizada','gorgonzola','parmesano','queso de cabra'], ARRAY['gluten','lacteos'], false, 'Todos los quesos son de leche pasteurizada.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000001' and nombre = 'Pizza cuatro quesos');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000001', 'Ravioli de ricotta y espinacas', 'Principal', 'Con mantequilla y salvia.', 14, ARRAY['pasta de huevo','ricotta','espinacas','mantequilla','salvia','parmesano'], ARRAY['gluten','huevo','lacteos'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000001' and nombre = 'Ravioli de ricotta y espinacas');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000001', 'Panna cotta con frutos rojos', 'Postre', 'Postre cremoso de nata.', 6, ARRAY['nata','leche','azúcar','gelatina','frutos rojos'], ARRAY['lacteos'], false, 'Se cuaja con gelatina animal.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000001' and nombre = 'Panna cotta con frutos rojos');

-- Restaurante 02
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000002', 'Calamares a la romana', 'Entrante', 'Anillas de calamar rebozadas con limón.', 9, ARRAY['calamar','harina de trigo','huevo','aceite de oliva','limón'], ARRAY['moluscos','gluten','huevo'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000002' and nombre = 'Calamares a la romana');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000002', 'Bocadillo de calamares', 'Principal', 'El clásico madrileño en pan de barra.', 6.5, ARRAY['pan de trigo','calamar','harina de trigo','huevo','alioli'], ARRAY['gluten','moluscos','huevo'], true, 'El alioli va aparte; se puede pedir sin alioli.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000002' and nombre = 'Bocadillo de calamares');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000002', 'Champiñones al ajillo', 'Entrante', 'Salteados con ajo, guindilla y un toque de vino.', 7, ARRAY['champiñones','ajo','guindilla','aceite de oliva','perejil','vino blanco'], ARRAY['sulfitos'], true, 'Se puede pedir sin guindilla.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000002' and nombre = 'Champiñones al ajillo');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000002', 'Torreznos de Soria', 'Entrante', 'Panceta crujiente.', 6, ARRAY['panceta de cerdo','sal','aceite de oliva'], ARRAY[]::text[], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000002' and nombre = 'Torreznos de Soria');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000002', 'Morcilla de Burgos con pimientos', 'Entrante', 'A la plancha con pimientos del piquillo.', 7.5, ARRAY['morcilla de Burgos (sangre de cerdo, arroz, cebolla)','pimiento del piquillo'], ARRAY[]::text[], false, 'La morcilla se hace bien a la plancha.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000002' and nombre = 'Morcilla de Burgos con pimientos');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000002', 'Oreja a la plancha', 'Entrante', 'Con ajo, pimentón y perejil.', 7, ARRAY['oreja de cerdo','ajo','pimentón','perejil','aceite de oliva'], ARRAY[]::text[], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000002' and nombre = 'Oreja a la plancha');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000002', 'Arroz con leche', 'Postre', 'Casero, con canela.', 4.5, ARRAY['arroz','leche','azúcar','canela','piel de limón'], ARRAY['lacteos'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000002' and nombre = 'Arroz con leche');

-- Restaurante 03
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000003', 'Hummus de remolacha con crudités', 'Entrante', 'Con zanahoria y pepino para mojar.', 7, ARRAY['garbanzos','remolacha','tahini','limón','ajo','zanahoria','pepino'], ARRAY['sesamo'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000003' and nombre = 'Hummus de remolacha con crudités');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000003', 'Ensalada thai con salsa de cacahuete', 'Entrante', 'Col, zanahoria, edamame y cilantro.', 10, ARRAY['col','zanahoria','edamame','cilantro','salsa de cacahuete','lima','salsa de soja'], ARRAY['cacahuete','soja','gluten'], true, 'La salsa de cacahuete va aparte; se puede cambiar por aliño de lima y aceite.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000003' and nombre = 'Ensalada thai con salsa de cacahuete');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000003', 'Pad thai de tofu', 'Principal', 'Fideos de arroz salteados con tofu y brotes.', 12.5, ARRAY['fideos de arroz','tofu','brotes de soja','cacahuetes','cebolleta','salsa de tamarindo','salsa de soja'], ARRAY['cacahuete','soja','gluten'], true, 'Los cacahuetes picados van por encima y se pueden omitir. La salsa de soja contiene gluten.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000003' and nombre = 'Pad thai de tofu');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000003', 'Lasaña de verduras', 'Principal', 'Con crema de anacardos y levadura nutricional.', 13, ARRAY['pasta de trigo','calabacín','berenjena','tomate','crema de anacardos','levadura nutricional'], ARRAY['gluten','frutos_secos'], false, 'La crema que sustituye a la bechamel es de anacardos.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000003' and nombre = 'Lasaña de verduras');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000003', 'Croquetas de setas', 'Entrante', 'Cremosas, con bebida de avena (6 uds).', 8, ARRAY['setas','harina de trigo','bebida de avena','pan rallado','aceite de oliva'], ARRAY['gluten'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000003' and nombre = 'Croquetas de setas');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000003', 'Smoothie verde', 'Bebida', 'Espinacas, plátano, manzana y jengibre.', 5, ARRAY['espinacas','plátano','manzana','jengibre','bebida de almendra'], ARRAY['frutos_secos'], true, 'Se puede pedir con bebida de avena en lugar de almendra.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000003' and nombre = 'Smoothie verde');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000003', 'Brownie vegano', 'Postre', 'Con nueces y chocolate negro.', 5.5, ARRAY['chocolate negro','harina de trigo','azúcar','nueces','aceite de coco'], ARRAY['gluten','frutos_secos'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000003' and nombre = 'Brownie vegano');

-- Restaurante 04
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000004', 'Sashimi de atún', 'Principal', 'Atún rojo cortado al momento.', 16, ARRAY['atún rojo crudo','wasabi','jengibre encurtido'], ARRAY['pescado'], false, 'Pescado crudo (congelado previamente).'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000004' and nombre = 'Sashimi de atún');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000004', 'Uramaki California', 'Principal', '8 piezas con surimi y aguacate.', 10, ARRAY['arroz','alga nori','surimi','aguacate','pepino','mayonesa','sésamo'], ARRAY['pescado','crustaceos','huevo','sesamo'], false, 'El surimi contiene pescado y extracto de crustáceo.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000004' and nombre = 'Uramaki California');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000004', 'Yakisoba de pollo', 'Principal', 'Fideos de trigo salteados con verduras.', 13, ARRAY['fideos de trigo','pollo','col','zanahoria','salsa yakisoba (soja, worcestershire)','sésamo'], ARRAY['gluten','soja','sesamo','pescado'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000004' and nombre = 'Yakisoba de pollo');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000004', 'Sopa de miso', 'Entrante', 'Con tofu, wakame y cebolleta.', 4.5, ARRAY['caldo dashi (bonito seco)','pasta de miso','tofu','alga wakame','cebolleta'], ARRAY['pescado','soja'], false, 'El caldo dashi se hace con bonito seco.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000004' and nombre = 'Sopa de miso');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000004', 'Gyozas de verduras', 'Entrante', 'Con shiitake y col (6 uds).', 8, ARRAY['harina de trigo','col','zanahoria','setas shiitake','cebollino','salsa de soja'], ARRAY['gluten','soja'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000004' and nombre = 'Gyozas de verduras');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000004', 'Tataki de atún', 'Principal', 'Atún marcado con sésamo y ponzu.', 17, ARRAY['atún marcado (crudo por dentro)','sésamo','salsa ponzu (soja)'], ARRAY['pescado','sesamo','soja','gluten'], false, 'Solo se marca por fuera; el interior queda crudo.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000004' and nombre = 'Tataki de atún');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000004', 'Helado de sésamo negro', 'Postre', 'Casero.', 5, ARRAY['leche','nata','azúcar','sésamo negro','yema de huevo'], ARRAY['lacteos','huevo','sesamo'], false, 'Base de crema inglesa cocida.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000004' and nombre = 'Helado de sésamo negro');

-- Restaurante 05
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000005', 'Morcilla y chorizo criollo', 'Entrante', 'A la brasa, con pan de hogaza.', 9, ARRAY['morcilla','chorizo criollo','pan de trigo'], ARRAY['gluten'], true, 'El pan se sirve aparte.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000005' and nombre = 'Morcilla y chorizo criollo');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000005', 'Mollejas de ternera', 'Entrante', 'A la brasa con limón.', 14, ARRAY['mollejas de ternera','sal','limón'], ARRAY[]::text[], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000005' and nombre = 'Mollejas de ternera');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000005', 'Entrecot de vaca con patatas', 'Principal', 'Con chimichurri casero.', 26, ARRAY['entrecot de vaca','patatas','sal','chimichurri (perejil, ajo, vinagre, guindilla)'], ARRAY['sulfitos'], true, 'Se sirve al punto; se puede pedir muy hecho. El chimichurri va aparte.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000005' and nombre = 'Entrecot de vaca con patatas');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000005', 'Cordero lechal asado', 'Principal', 'Paletilla al horno de leña.', 28, ARRAY['paletilla de cordero','manteca de cerdo','ajo','vino blanco','patatas'], ARRAY['sulfitos'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000005' and nombre = 'Cordero lechal asado');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000005', 'Verduras a la brasa con romesco', 'Principal', 'Berenjena, calabacín, cebolla y espárragos.', 14, ARRAY['berenjena','calabacín','cebolla','espárragos','salsa romesco (almendras, avellanas, pan, ñora, tomate)'], ARRAY['frutos_secos','gluten'], true, 'El romesco va aparte; se puede pedir solo con aceite y sal.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000005' and nombre = 'Verduras a la brasa con romesco');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000005', 'Patatas asadas con alioli', 'Entrante', 'Al horno, con alioli casero.', 6, ARRAY['patatas','alioli casero (huevo, ajo, aceite)'], ARRAY['huevo'], true, 'Se pueden pedir sin alioli.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000005' and nombre = 'Patatas asadas con alioli');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000005', 'Flan de dulce de leche', 'Postre', 'Con nata montada.', 6.5, ARRAY['huevo','leche','azúcar','dulce de leche','nata'], ARRAY['huevo','lacteos'], true, 'Cuajado al baño maría. La nata se puede quitar.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000005' and nombre = 'Flan de dulce de leche');

-- Restaurante 06
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000006', 'Croquetas de jamón sin gluten', 'Entrante', 'Rebozado sin gluten, freidora exclusiva (6 uds).', 9, ARRAY['jamón serrano','leche','mantequilla','harina de arroz','pan rallado sin gluten'], ARRAY['lacteos'], false, 'Freidora exclusiva para productos sin gluten.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000006' and nombre = 'Croquetas de jamón sin gluten');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000006', 'Tacos de pollo', 'Principal', 'Tortilla de maíz con guacamole y pico de gallo.', 12, ARRAY['tortilla de maíz','pollo','guacamole','pico de gallo','crema agria'], ARRAY['lacteos'], true, 'La crema agria se pone al final; se puede omitir.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000006' and nombre = 'Tacos de pollo');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000006', 'Ramen de verduras sin gluten', 'Principal', 'Fideos de arroz, tofu y setas.', 13, ARRAY['fideos de arroz','caldo de verduras','tofu','setas','cebolleta','tamari sin gluten','huevo marinado (yema líquida)'], ARRAY['soja','huevo'], true, 'El huevo marinado se puede retirar.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000006' and nombre = 'Ramen de verduras sin gluten');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000006', 'Salmón a la plancha con verduras', 'Principal', 'Con calabacín y espárragos.', 16, ARRAY['salmón','calabacín','espárragos','limón','aceite de oliva'], ARRAY['pescado'], false, 'Se hace en su punto, bien cocinado por dentro.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000006' and nombre = 'Salmón a la plancha con verduras');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000006', 'Hummus con crudités', 'Entrante', 'Con zanahoria, pepino y apio.', 7, ARRAY['garbanzos','tahini','limón','ajo','zanahoria','pepino','apio'], ARRAY['sesamo','apio'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000006' and nombre = 'Hummus con crudités');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000006', 'Tarta de queso sin gluten', 'Postre', 'Horneada, con base de almendra.', 6.5, ARRAY['queso crema pasteurizado','huevo','nata','azúcar','base de almendra'], ARRAY['lacteos','huevo','frutos_secos'], false, 'Horneada hasta cuajar por completo.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000006' and nombre = 'Tarta de queso sin gluten');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000006', 'Batido de fresa', 'Bebida', 'Con fresas naturales.', 4.5, ARRAY['leche','fresas','azúcar'], ARRAY['lacteos'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000006' and nombre = 'Batido de fresa');

-- Restaurante 07
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000007', 'Nachos con queso', 'Entrante', 'Totopos con cheddar, frijoles, jalapeños y crema agria.', 9, ARRAY['totopos de maíz','queso cheddar fundido','frijoles','jalapeños','pico de gallo','crema agria'], ARRAY['lacteos'], true, 'Queso y crema agria se pueden omitir; los jalapeños también.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000007' and nombre = 'Nachos con queso');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000007', 'Tacos de cochinita pibil', 'Principal', 'Cerdo en achiote con cebolla morada (3 uds).', 10, ARRAY['tortilla de maíz','cerdo marinado en achiote','cebolla morada encurtida','naranja agria'], ARRAY[]::text[], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000007' and nombre = 'Tacos de cochinita pibil');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000007', 'Tacos de pescado estilo Baja', 'Principal', 'Pescado rebozado en cerveza con salsa chipotle.', 11, ARRAY['tortilla de maíz','merluza rebozada (harina de trigo, cerveza)','col','salsa chipotle (mayonesa)'], ARRAY['pescado','gluten','huevo'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000007' and nombre = 'Tacos de pescado estilo Baja');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000007', 'Enchiladas de pollo con mole', 'Principal', 'Mole poblano casero y queso fresco.', 12, ARRAY['tortilla de maíz','pollo','mole poblano (chocolate, chiles, cacahuete, almendras, sésamo, pan)','queso fresco','nata'], ARRAY['cacahuete','frutos_secos','sesamo','gluten','lacteos'], false, 'El mole lleva cacahuete, almendra, sésamo y pan; no hay versión sin él.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000007' and nombre = 'Enchiladas de pollo con mole');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000007', 'Elote asado', 'Entrante', 'Mazorca con mayonesa, queso cotija y chile.', 5, ARRAY['mazorca de maíz','mayonesa','queso cotija','chile en polvo','lima'], ARRAY['huevo','lacteos'], true, 'Mayonesa y queso se pueden omitir.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000007' and nombre = 'Elote asado');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000007', 'Churros con chocolate', 'Postre', 'Recién hechos.', 6, ARRAY['harina de trigo','agua','aceite','azúcar','chocolate a la taza (leche)'], ARRAY['gluten','lacteos'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000007' and nombre = 'Churros con chocolate');

-- Restaurante 08
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000008', 'Tabulé', 'Entrante', 'Ensalada de bulgur con hierbas.', 7, ARRAY['bulgur de trigo','perejil','menta','tomate','cebolla','limón','aceite de oliva'], ARRAY['gluten'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000008' and nombre = 'Tabulé');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000008', 'Pimientos rellenos de arroz', 'Principal', 'Con verduras, piñones y pasas.', 12, ARRAY['pimiento','arroz','cebolla','piñones','pasas','tomate'], ARRAY['frutos_secos'], false, 'Los piñones van mezclados en el relleno.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000008' and nombre = 'Pimientos rellenos de arroz');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000008', 'Brochetas de pollo con tzatziki', 'Principal', 'Con pan de pita.', 13, ARRAY['pollo','yogur','pepino','ajo','pan de pita'], ARRAY['lacteos','gluten'], true, 'El tzatziki y el pan de pita van aparte.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000008' and nombre = 'Brochetas de pollo con tzatziki');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000008', 'Mejillones a la marinera', 'Entrante', 'En salsa de tomate y vino.', 11, ARRAY['mejillones','tomate','cebolla','vino blanco','ajo','harina'], ARRAY['moluscos','sulfitos','gluten'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000008' and nombre = 'Mejillones a la marinera');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000008', 'Ensalada de lentejas', 'Entrante', 'Con pimiento, tomate y feta.', 8, ARRAY['lentejas','pimiento','cebolla','tomate','feta pasteurizado','vinagre'], ARRAY['lacteos','sulfitos'], true, 'El feta se puede retirar.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000008' and nombre = 'Ensalada de lentejas');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000008', 'Yogur griego con miel y nueces', 'Postre', 'Cremoso.', 5, ARRAY['yogur griego','miel','nueces'], ARRAY['lacteos','frutos_secos'], true, 'Las nueces van por encima y se pueden omitir.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000008' and nombre = 'Yogur griego con miel y nueces');

-- Restaurante 09
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000009', 'Sopa castellana', 'Entrante', 'Con jamón, pan y huevo escalfado.', 7, ARRAY['pan de trigo','jamón','ajo','pimentón','huevo escalfado','caldo de ave'], ARRAY['gluten','huevo'], false, 'El huevo se escalfa en la sopa y queda con la yema líquida.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000009' and nombre = 'Sopa castellana');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000009', 'Callos a la madrileña', 'Principal', 'Con chorizo, morcilla y un punto picante.', 12, ARRAY['callos de ternera','morro','pata','chorizo','morcilla','pimentón','guindilla'], ARRAY[]::text[], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000009' and nombre = 'Callos a la madrileña');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000009', 'Judías verdes con patata', 'Entrante', 'Rehogadas con ajo y pimentón.', 6.5, ARRAY['judías verdes','patata','ajo','aceite de oliva','pimentón'], ARRAY[]::text[], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000009' and nombre = 'Judías verdes con patata');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000009', 'Bacalao con tomate', 'Principal', 'Enharinado y guisado en tomate casero.', 14, ARRAY['bacalao','tomate','cebolla','pimiento','harina de trigo','aceite de oliva'], ARRAY['pescado','gluten'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000009' and nombre = 'Bacalao con tomate');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000009', 'Filete ruso con patatas', 'Principal', 'Hamburguesa casera empanada.', 10, ARRAY['carne picada de ternera','huevo','pan rallado','ajo','perejil','patatas'], ARRAY['gluten','huevo'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000009' and nombre = 'Filete ruso con patatas');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000009', 'Garbanzos con espinacas', 'Principal', 'Guiso andaluz con majado de pan frito.', 9, ARRAY['garbanzos','espinacas','ajo','pimentón','comino','pan frito'], ARRAY['gluten'], true, 'El majado de pan frito se puede omitir.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000009' and nombre = 'Garbanzos con espinacas');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000009', 'Natillas con galleta', 'Postre', 'Caseras, con canela.', 4.5, ARRAY['leche','yemas de huevo','azúcar','canela','galleta maría'], ARRAY['lacteos','huevo','gluten'], true, 'La galleta va encima y se puede quitar. Las natillas se cuecen.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000009' and nombre = 'Natillas con galleta');

-- Restaurante 10
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000010', 'Pakoras de verduras', 'Entrante', 'Buñuelos de harina de garbanzo.', 6, ARRAY['harina de garbanzo','cebolla','espinacas','especias','aceite'], ARRAY[]::text[], false, 'Se fríen en la misma freidora que las samosas (trigo).'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000010' and nombre = 'Pakoras de verduras');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000010', 'Biryani de cordero', 'Principal', 'Arroz especiado con cordero y yogur.', 15, ARRAY['arroz basmati','cordero','yogur','cebolla frita','especias','anacardos','pasas'], ARRAY['lacteos','frutos_secos'], true, 'Los anacardos van por encima y se pueden retirar.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000010' and nombre = 'Biryani de cordero');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000010', 'Chana masala', 'Principal', 'Garbanzos en salsa de tomate especiada.', 11, ARRAY['garbanzos','tomate','cebolla','jengibre','especias','aceite'], ARRAY[]::text[], false, 'Se cocina con aceite, sin ghee.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000010' and nombre = 'Chana masala');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000010', 'Korma de pollo', 'Principal', 'Salsa suave de nata y almendra.', 14, ARRAY['pollo','nata','almendras molidas','coco','especias'], ARRAY['lacteos','frutos_secos'], false, 'La salsa lleva almendra molida.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000010' and nombre = 'Korma de pollo');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000010', 'Gambas al curry', 'Principal', 'Con leche de coco y tomate.', 16, ARRAY['gambas','leche de coco','tomate','curry','cilantro'], ARRAY['crustaceos'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000010' and nombre = 'Gambas al curry');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000010', 'Arroz basmati', 'Entrante', 'Guarnición al vapor.', 3.5, ARRAY['arroz basmati','sal'], ARRAY[]::text[], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000010' and nombre = 'Arroz basmati');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000010', 'Kulfi de pistacho', 'Postre', 'Helado tradicional indio.', 5, ARRAY['leche','azúcar','pistachos','cardamomo'], ARRAY['lacteos','frutos_secos'], false, 'Leche cocida y reducida (pasteurizada).'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000010' and nombre = 'Kulfi de pistacho');

-- Restaurante 11
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000011', 'Escargots à la bourguignonne', 'Entrante', 'Caracoles con mantequilla de ajo y perejil.', 14, ARRAY['caracoles','mantequilla','ajo','perejil','pan'], ARRAY['moluscos','lacteos','gluten'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000011' and nombre = 'Escargots à la bourguignonne');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000011', 'Ensalada de queso de cabra caliente', 'Entrante', 'Con nueces y miel.', 12, ARRAY['queso de cabra de leche cruda','pan','nueces','miel','lechuga'], ARRAY['lacteos','frutos_secos','gluten'], true, 'Queso de cabra de leche cruda. Se puede pedir sin queso.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000011' and nombre = 'Ensalada de queso de cabra caliente');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000011', 'Croque monsieur', 'Principal', 'Jamón cocido, emmental y bechamel gratinados.', 11, ARRAY['pan de molde','jamón cocido','queso emmental','bechamel','mantequilla'], ARRAY['gluten','lacteos'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000011' and nombre = 'Croque monsieur');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000011', 'Ratatouille', 'Principal', 'Verduras de Provenza guisadas lentamente.', 15, ARRAY['berenjena','calabacín','pimiento','tomate','cebolla','hierbas provenzales','aceite de oliva'], ARRAY[]::text[], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000011' and nombre = 'Ratatouille');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000011', 'Moules marinières', 'Principal', 'Mejillones al vino blanco con patatas fritas.', 19, ARRAY['mejillones','vino blanco','chalota','nata','perejil','patatas fritas'], ARRAY['moluscos','lacteos','sulfitos'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000011' and nombre = 'Moules marinières');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000011', 'Tarte tatin', 'Postre', 'Tarta de manzana caramelizada con nata.', 8, ARRAY['manzana','mantequilla','azúcar','masa de hojaldre','nata'], ARRAY['gluten','lacteos'], true, 'La nata se sirve aparte.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000011' and nombre = 'Tarte tatin');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000011', 'Mousse au chocolat', 'Postre', 'Receta clásica.', 7, ARRAY['chocolate negro','huevo crudo','azúcar','nata'], ARRAY['huevo','lacteos'], false, 'Se elabora con claras montadas crudas.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000011' and nombre = 'Mousse au chocolat');

-- Restaurante 12
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000012', 'Poke de atún picante', 'Principal', 'Atún crudo con mayonesa de sriracha.', 14, ARRAY['atún crudo','arroz de sushi','mayonesa picante (sriracha, huevo)','aguacate','pepino','sésamo'], ARRAY['pescado','huevo','sesamo'], true, 'Se puede cambiar la proteína por tofu o pollo.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000012' and nombre = 'Poke de atún picante');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000012', 'Poke de langostinos', 'Principal', 'Langostinos cocidos con mango y wakame.', 14, ARRAY['langostinos cocidos','arroz de sushi','mango','edamame','salsa ponzu (soja)','alga wakame'], ARRAY['crustaceos','soja','gluten'], true, 'Se puede cambiar la proteína por tofu o pollo.'
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000012' and nombre = 'Poke de langostinos');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000012', 'Poke vegano de garbanzos', 'Principal', 'Garbanzos crujientes, quinoa, boniato y kale.', 12, ARRAY['garbanzos especiados','quinoa','boniato','kale','aguacate','salsa de tahini'], ARRAY['sesamo'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000012' and nombre = 'Poke vegano de garbanzos');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000012', 'Gyozas de pollo', 'Entrante', 'A la plancha (5 uds).', 7, ARRAY['harina de trigo','pollo','col','jengibre','salsa de soja'], ARRAY['gluten','soja'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000012' and nombre = 'Gyozas de pollo');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000012', 'Mochi de mango', 'Postre', '2 unidades.', 5, ARRAY['harina de arroz glutinoso','azúcar','helado de mango (leche, nata)'], ARRAY['lacteos'], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000012' and nombre = 'Mochi de mango');
insert into public.platos (restaurante_id, nombre, categoria, descripcion, precio, ingredientes, alergenos_declarados, permite_modificacion, nota_cocina)
select '00000000-0000-4000-a000-000000000012', 'Kombucha de jengibre', 'Bebida', 'Té fermentado artesanal.', 4, ARRAY['té fermentado','azúcar','jengibre'], ARRAY[]::text[], false, null
where not exists (select 1 from public.platos where restaurante_id = '00000000-0000-4000-a000-000000000012' and nombre = 'Kombucha de jengibre');
