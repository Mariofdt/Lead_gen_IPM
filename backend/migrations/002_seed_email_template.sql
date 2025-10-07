INSERT INTO public.email_templates(name, subject, body, is_active)
VALUES (
  'Default IperMoney',
  'Opportunità White Label POS IperMoney - Commissioni sul Transato',
  'Buongiorno,\n\nSiamo IperMoney, operatore indipendente di Acquiring, membro ufficiale Visa e Mastercard con licenze operative in tutta Europa.\n\nLe proponiamo una partnership esclusiva per la distribuzione dei nostri terminali POS in modalità white label:\n\n✓ Prodotto brandizzabile con il vostro marchio\n✓ Commissioni competitive sul transato\n✓ Supporto tecnico dedicato\n✓ Copertura europea completa\n\nPer manifestare il suo interesse e ricevere maggiori informazioni commerciali, può compilare il modulo al seguente link: [INTEREST_FORM_LINK]\n\nRestiamo a disposizione per un confronto.\n\nCordiali saluti,\nIperMoney Team\nwww.ipermoney.com',
  true
)
ON CONFLICT DO NOTHING;

