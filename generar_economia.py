import pandas as pd

# 1. Definir los datos
data_anual = {
    "Año": [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
    "Crecimiento PIB (%)": [3.8, 0.1, -1.2, 2.4, 1.3, 0.0, -7.8, 4.2, 2.9, 2.4],
    "Inflación (%)": [3.6, 4.0, 1.7, 0.4, -0.2, 0.3, -0.3, 0.1, 3.5, 2.2],
    "Desempleo (%)": [3.8, 4.3, 5.2, 4.6, 4.8, 3.8, 5.0, 4.3, 3.8, 3.8]
}
df_annual = pd.DataFrame(data_anual)

df_5_yr = pd.DataFrame({
    "Periodo": ["2014-2018", "2019-2023"],
    "Crecimiento PIB (Promedio %)": [df_annual["Crecimiento PIB (%)"][0:5].mean(), df_annual["Crecimiento PIB (%)"][5:10].mean()],
    "Inflación (Promedio %)": [df_annual["Inflación (%)"][0:5].mean(), df_annual["Inflación (%)"][5:10].mean()],
    "Desempleo (Promedio %)": [df_annual["Desempleo (%)"][0:5].mean(), df_annual["Desempleo (%)"][5:10].mean()]
})

df_10_yr = pd.DataFrame({
    "Periodo": ["2014-2023"],
    "Crecimiento PIB (Promedio %)": [df_annual["Crecimiento PIB (%)"].mean()],
    "Inflación (Promedio %)": [df_annual["Inflación (%)"].mean()],
    "Desempleo (Promedio %)": [df_annual["Desempleo (%)"].mean()]
})

# 2. Configurar el motor de Excel (xlsxwriter permite crear gráficas nativas)
excel_file = "Ecuador_Economia_10_Anios.xlsx"
writer = pd.ExcelWriter(excel_file, engine='xlsxwriter')
workbook = writer.book

# --- HOJA 1: ANUAL ---
df_annual.to_excel(writer, sheet_name="Anual", index=False)
worksheet1 = writer.sheets["Anual"]

# Gráfica de Barras Anual (Evolución del PIB)
chart_bar1 = workbook.add_chart({'type': 'column'})
chart_bar1.add_series({
    'name':       'Crecimiento PIB (%)',
    'categories': ['Anual', 1, 0, 10, 0], # A2:A11 (Años)
    'values':     ['Anual', 1, 1, 10, 1], # B2:B11 (Crecimiento PIB)
})
chart_bar1.set_title({'name': 'Crecimiento del PIB Año a Año'})
worksheet1.insert_chart('F2', chart_bar1)

# Gráfica de Pastel Anual (Distribución del Desempleo)
chart_pie1 = workbook.add_chart({'type': 'pie'})
chart_pie1.add_series({
    'name':       'Desempleo (%)',
    'categories': ['Anual', 1, 0, 10, 0],
    'values':     ['Anual', 1, 3, 10, 3], # D2:D11 (Desempleo)
})
chart_pie1.set_title({'name': 'Proporción de Tasas de Desempleo Anual'})
worksheet1.insert_chart('F17', chart_pie1)


# --- HOJA 2: QUINQUENAL (Cada 5 años) ---
df_5_yr.to_excel(writer, sheet_name="Quinquenal", index=False)
worksheet2 = writer.sheets["Quinquenal"]

# Gráfica de Barras Quinquenal (Comparativa de los 3 indicadores)
chart_bar2 = workbook.add_chart({'type': 'column'})
chart_bar2.add_series({'name': 'Crecimiento PIB', 'categories': ['Quinquenal', 1, 0, 2, 0], 'values': ['Quinquenal', 1, 1, 2, 1]})
chart_bar2.add_series({'name': 'Inflación',       'categories': ['Quinquenal', 1, 0, 2, 0], 'values': ['Quinquenal', 1, 2, 2, 2]})
chart_bar2.add_series({'name': 'Desempleo',       'categories': ['Quinquenal', 1, 0, 2, 0], 'values': ['Quinquenal', 1, 3, 2, 3]})
chart_bar2.set_title({'name': 'Indicadores Promedio (Por Quinquenio)'})
worksheet2.insert_chart('F2', chart_bar2)

# Gráfica de Pastel Quinquenal (Proporción del Desempleo)
chart_pie2 = workbook.add_chart({'type': 'pie'})
chart_pie2.add_series({
    'name':       'Desempleo Promedio',
    'categories': ['Quinquenal', 1, 0, 2, 0],
    'values':     ['Quinquenal', 1, 3, 2, 3],
})
chart_pie2.set_title({'name': 'Peso del Desempleo por Periodo'})
worksheet2.insert_chart('F17', chart_pie2)


# --- HOJA 3: DÉCADA (10 Años completos) ---
df_10_yr.to_excel(writer, sheet_name="Decada", index=False)
worksheet3 = writer.sheets["Decada"]

# Gráfica de Barras Década (Resumen de los 3 indicadores)
chart_bar3 = workbook.add_chart({'type': 'column'})
chart_bar3.add_series({
    'name':       'Promedios de la Década',
    'categories': ['Decada', 0, 1, 0, 3], # Cabeceras B1:D1
    'values':     ['Decada', 1, 1, 1, 3], # Valores B2:D2
})
chart_bar3.set_title({'name': 'Promedio Macroeconómico (2014-2023)'})
worksheet3.insert_chart('F2', chart_bar3)

# Gráfica de Pastel Década (Composición de los indicadores promediados)
chart_pie3 = workbook.add_chart({'type': 'pie'})
chart_pie3.add_series({
    'name':       'Distribución de Indicadores',
    'categories': ['Decada', 0, 1, 0, 3], 
    'values':     ['Decada', 1, 1, 1, 3], 
})
chart_pie3.set_title({'name': 'Relación de Promedios Generales'})
worksheet3.insert_chart('F17', chart_pie3)

# Guardar y cerrar
writer.close()

print("El archivo Excel con sus tablas y gráficas se ha generado correctamente.")
