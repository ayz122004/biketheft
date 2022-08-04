#include <stdio.h>
#include <driverlib.h>
#include <SPI.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <stdlib.h>
#include <math.h>
#include <LCD_screen.h>
#include <LCD_screen_font.h>
#include <LCD_utilities.h>
#include <Screen_HX8353E.h>
#include <Terminal12e.h>
#include <Terminal6e.h>
#include <Terminal8e.h>
Screen_HX8353E myScreen;
// jellos

char buffer[3];
volatile uint8_t IO_button = 0;
volatile uint8_t flag = 0;
volatile uint32_t timer = 0;

// Global variables
volatile int theft_detected = 0;
volatile int base_acc[3] = {1, 2, 3}; // baseline acceleration
int theft_counter = 0;                // debug
int threshold[3] = {20, 20, 20};      // difference between baseline and detected acceleration
volatile uint32_t x_acc;
volatile uint32_t y_acc;
volatile uint32_t z_acc;
volatile int difference[3] = {0, 0, 0};
volatile int theft_axis = 0;

char buf[3];
// Wifi and Adafruit
char ssid[] = "eec172";
// char password[] = "9022895aA";
char server[] = "io.adafruit.com";
WiFiClient wifiClient;
PubSubClient client(server, 1883, callback, wifiClient);

void drawAccelData(void);

void callback(char *topic, byte *payload, unsigned int length)
{
    char *str = (char *)payload;
    if (str[1] == 'N')
    {
        IO_button = 1;
    }
    else if (str[1] == 'F')
    {
        IO_button = 0;
    }
}

void LCD_init()
{
    myScreen.begin();
    Serial.print("X Screen Size: ");
    Serial.println(myScreen.screenSizeX());
    Serial.print("Y Screen Size: ");
    Serial.println(myScreen.screenSizeY());
}

void ADC_init()
{
    /* Configures Pin 4.0, 4.2, and 6.1 ad ADC inputs */
    // ACC Z = P4.2
    // ACC Y = P4.0
    // ACC X = P6.1
    GPIO_setAsPeripheralModuleFunctionInputPin(GPIO_PORT_P4, GPIO_PIN0 | GPIO_PIN2, GPIO_TERTIARY_MODULE_FUNCTION);
    GPIO_setAsPeripheralModuleFunctionInputPin(GPIO_PORT_P6, GPIO_PIN1, GPIO_TERTIARY_MODULE_FUNCTION);

    ADC14_registerInterrupt(ADC14_IRQHandler);

    /* Initializing ADC (ADCOSC/64/8) */
    ADC14_enableModule();
    ADC14_initModule(ADC_CLOCKSOURCE_ADCOSC, ADC_PREDIVIDER_64, ADC_DIVIDER_8, 0);

    /* Configuring ADC Memory (ADC_MEM0 - ADC_MEM2 (A11, A13, A14)  with no repeat)
     * with internal 2.5v reference */
    ADC14_configureMultiSequenceMode(ADC_MEM0, ADC_MEM2, true);
    ADC14_configureConversionMemory(ADC_MEM0, ADC_VREFPOS_AVCC_VREFNEG_VSS, ADC_INPUT_A14, ADC_NONDIFFERENTIAL_INPUTS);

    ADC14_configureConversionMemory(ADC_MEM1, ADC_VREFPOS_AVCC_VREFNEG_VSS, ADC_INPUT_A13, ADC_NONDIFFERENTIAL_INPUTS);

    ADC14_configureConversionMemory(ADC_MEM2, ADC_VREFPOS_AVCC_VREFNEG_VSS, ADC_INPUT_A11, ADC_NONDIFFERENTIAL_INPUTS);

    /* Enabling the interrupt when a conversion on channel 2 (end of sequence)
     *  is complete and enabling conversions */
    ADC14_enableInterrupt(ADC_INT2);

    /* Enabling Interrupts */
    Interrupt_enableInterrupt(INT_ADC14);
    Interrupt_enableMaster();

    /* Setting up the sample timer to automatically step through the sequence
     * convert.*/
    ADC14_enableSampleTimer(ADC_AUTOMATIC_ITERATION);
    ADC14_setResolution(ADC_10BIT);

    /* Triggering the start of the sample */
    ADC14_enableConversion();
    ADC14_toggleConversionTrigger();
}

void drawAccelData(void)
{
    myScreen.gText(10, 10, "Bike theft detector (debug)");
    myScreen.gText(10, 30, "Theft timer: " + String(theft_counter));
    myScreen.gText(10, 50, "X Accel: " + String(x_acc));
    myScreen.gText(10, 70, "Y Accel: " + String(y_acc));
    myScreen.gText(10, 90, "Z Accel: " + String(z_acc));
}

void ADC14_IRQHandler(void)
{
    uint64_t status;
    status = MAP_ADC14_getEnabledInterruptStatus();
    MAP_ADC14_clearInterruptFlag(status);
    timer++;

    /* ADC_MEM2 conversion completed */
    if ((status & ADC_INT2) && (flag == 0))
    {

        if (IO_button == 1)
        {
            x_acc = ADC14_getResult(ADC_MEM0);
            y_acc = ADC14_getResult(ADC_MEM1);
            z_acc = ADC14_getResult(ADC_MEM2);

            difference[0] = abs(x_acc - base_acc[0]);
            difference[1] = abs(y_acc - base_acc[1]);
            difference[2] = abs(z_acc - base_acc[2]);
            if (isTheft(difference[0], difference[1], difference[2]))
            {
                theft_counter++;
                theft_detected = 1;
            }
        }

        // Draw Data On LCD Screen
        drawAccelData();
        flag = 1;
    }
}

bool isTheft(int x, int y, int z)
{
    theft_axis = 0;
    if (x > threshold[0])
    {
        theft_axis++;
    }
    if (y > threshold[1])
    {
        theft_axis++;
    }
    if (z > threshold[2])
    {
        theft_axis++;
    }
    if (theft_axis >= 2)
    {
        theft_axis = 0;
        return true;
    }
    return false;
}

void setup()
{
    WDT_A_hold(WDT_A_BASE);
    flag = 0;
    Serial.begin(9600);

    // Connect to wifi
    Serial.print("Attempting to connect to Network named: ");
    Serial.println(ssid);
    // WiFi.begin(ssid, password);
    WiFi.begin(ssid);

    while (WiFi.status() != WL_CONNECTED)
    {
        Serial.print(".");
        delay(300);
    }
    Serial.println("\nYou're connected to the network");

    LCD_init();
    ADC_init();
    update_status();
    Serial.println("setup done");
}

// Connect to Adafruit
void connect_button()
{
    // Reconnect if the connection was lost
    if (!client.connected())
    {
        Serial.println("Disconnected. Reconnecting....");

        if (!client.connect("energiaClient", "lmarielle", "aio_zNdR05IahkTM8hnglUWaYuR5KcU8"))
        {
            Serial.println("Connection failed");
        }
        else
        {
            Serial.println("Connection success");
            if (client.subscribe("lmarielle/feeds/bikeTheftButton"))
            {
                Serial.println("Subscription successful");
            }
        }
    }

    client.poll();
    delay(100);
}

// update status
void update_status()
{
    if (!client.connected())
    {
        Serial.println("Disconnected. Reconnecting....");

        if (!client.connect("energiaClient", "lmarielle", "aio_zNdR05IahkTM8hnglUWaYuR5KcU8"))
        {
            Serial.println("Connection failed");
        }
        else
        {
            Serial.println("Connection success");
        }
    }

    if (client.publish("lmarielle/feeds/bikeStatus", itoa(theft_detected, buf, 10)))
    {
        Serial.println("Publish success");
    }
    else
    {
        Serial.println("Publish failed");
    }
}

void loop()
{
    if (flag == 1 && theft_detected == 1 && IO_button == 1)
    {
        update_status();
        Serial.println("dif x vale w publish: " + String(difference[0]));
        Serial.println("dif y vale w publish: " + String(difference[1]));
        Serial.println("dif z vale w publish: " + String(difference[2]));
        do
        {
            connect_button();
        } while (IO_button == 1);
        theft_detected = 0;
        update_status();
    }
    if (flag == 1 && IO_button == 0)
    {
        Serial.println(String(IO_button));
        do
        {
            connect_button();
            Serial.println("getting button value");
        } while (IO_button == 0);
        Serial.println("button turned on");
        base_acc[0] = ADC14_getResult(ADC_MEM0);
        base_acc[1] = ADC14_getResult(ADC_MEM1);
        base_acc[2] = ADC14_getResult(ADC_MEM2);
        Serial.println("base x vale: " + String(base_acc[0]));
        Serial.println("base y vale: " + String(base_acc[1]));
        Serial.println("base z vale: " + String(base_acc[2]));
    }
    else if (flag == 1 && IO_button == 1)
    {
        if (timer >= 30)
        {
            connect_button();
            Serial.println("IO_button: " + String(IO_button));
            if (IO_button == 1)
            {
                flag = 0;
                Serial.println("starting accelerometer inturrupt");
                Serial.println("dif x vale: " + String(difference[0]));
                Serial.println("dif y vale: " + String(difference[1]));
                Serial.println("dif z vale: " + String(difference[2]));
            }
            timer = 0;
        }
        else
        {
            flag = 0;
        }
    }
    else
    {
        flag = 0;
    }
}